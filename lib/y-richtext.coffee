misc = (require "./misc.coffee")
BaseClass = misc.BaseClass
Locker = misc.Locker
Editors = (require "./editors.coffee")
# All dependencies (like Y.Selections) to other types (that have its own
# repository) should  be included by the user (in order to reduce the amount of
# downloaded content).
# With html5 imports, we can include it automatically too. But with the old
# script tags this is the best solution that came to my mind.

# A class holding the information about rich text
class YRichText extends BaseClass
  # @param content [String] an initial string
  # @param editor [Editor] an editor instance
  # @param author [String] the name of the local author
  constructor: (editor_name, editor_instance) ->
    @locker = new Locker()

    if editor_name? and editor_instance?
      @_bind_later =
        name: editor_name
        instance: editor_instance

    # TODO: generate a UID (you can get a unique id by calling
    # `@_model.getUid()` - is this what you mean?)
    # @author = author
    # TODO: assign an id / author name to the rich text instance for authorship

  #
  # Bind the RichText type to a rich text editor (e.g. quilljs)
  #
  bind: ()->
    # TODO: bind to multiple editors
    if arguments[0] instanceof Editors.AbstractEditor
      # is already an editor!
      @editor = arguments[0]
    else
      [editor_name, editor_instance] = arguments
      if @editor? and @editor.getEditor() is editor_instance
        # return, if @editor is already bound! (never bind twice!)
        return
      Editor = Editors[editor_name]
      if Editor?
        @editor = new Editor editor_instance
      else
        throw new Error "This type of editor is not supported! ("+editor_name+")"

    # TODO: parse the following directly from $characters+$selections (in O(n))
    # @editor.editor.deleteText(0, @editor.editor.getText().length)
    @editor.setContents
      ops: @getDelta()

    # bind the rest..
    @editor.observeLocalText @passDeltas
    @bindEventsToEditor @editor
    @editor.observeLocalCursor @updateCursorPosition

  getDelta: ()->
    text_content = @_model.getContent('characters').val()
    # transform Y.Selections.getSelections() to a delta
    expected_pos = 0
    deltas = []
    for sel in @_model.getContent("selections").getSelections(@_model.getContent("characters"))
      selection_length = sel.to - sel.from + 1 # (+1), because if we select from 1 to 1, then the length is 1
      if expected_pos isnt sel.from
        # There is unselected text. $retain to the next selection
        deltas.push
          insert: text_content.splice(0, sel.from-expected_pos).join('')
      deltas.push
        insert: text_content.splice(0, selection_length).join('')
        attributes: sel.attrs
      expected_pos += selection_length
    if text_content.length > 0
      deltas.push
        insert: text_content.join('')
    deltas

  _getModel: (Y, Operation) ->
    if not @_model?
      # we save this stuff as _static_ content now.
      # Therefore, you can't overwrite it, after you once saved it.
      # But on the upside, we can always make sure, that they are defined!
      content_operations =
        selections: new Y.Selections()
        characters: new Y.List()
        cursors: new Y.Object()
      @_model = new Operation.MapManager(@, null, {}, content_operations ).execute()

      @_setModel @_model

      if @_bind_later?
        Editor = Editors[@_bind_later.name]
        if Editor?
          editor = new Editor @_bind_later.instance
        else
          throw new Error "This type of editor is not supported! ("+editor_name+") -- fatal error!"
        @passDeltas editor.getContents()
        @bind editor
        delete @_bind_later

      # listen to events on the model using the function propagateToEditor
      @_model.observe @propagateToEditor
    return @_model

  _setModel: (model) ->
    super

  _name: "RichText"

  getText: ()->
    @_model.getContent('characters').val().join('')

  # insert our own cursor in the cursors object
  # @param position [Integer] the position where to insert it
  setCursor : (position) ->
    @selfCursor = @_model.getContent("characters").ref(position)
    @_model.getContent("cursors").val(@_model.HB.getUserId(), @selfCursor)


  # pass deltas to the character instance
  # @param deltas [Array<Object>] an array of deltas (see ot-types for more info)
  passDeltas : (deltas) => @locker.try ()=>
    position = 0
    console.log deltas
    for delta in deltas
      position = deltaHelper @, delta, position

  # @override updateCursorPosition(index)
  #   update the position of our cursor to the new one using an index
  #   @param index [Integer] the new index
  # @override updateCursorPosition(character)
  #   update the position of our cursor to the new one using a character
  #   @param character [Character] the new character
  updateCursorPosition : (obj) => @locker.try ()=>
    if typeof obj is "number"
      @selfCursor = @_model.getContent("characters").ref(obj)
    else
      @selfCursor = obj
    @_model.getContent("cursors").val(@_model.HB.getUserId(), @selfCursor)

  # describe how to propagate yjs events to the editor
  # TODO: should be private!
  bindEventsToEditor : (editor) ->
    # update the editor when something on the $characters happens
    @_model.getContent("characters").observe (events) => @locker.try ()=>
      for event in events
        delta =
          ops: [{retain: event.position}]

        if event.type is "insert"
          delta.ops.push {insert: event.value}

        else if event.type is "delete"
          delta.ops.push {delete: 1}

        @editor.updateContents delta

    # update the editor when something on the $selections happens
    @_model.getContent("selections").observe (event)=> @locker.try ()=>
      attrs = {}
      if event.type is "select"
        for attr,val of event.attrs
          attrs[attr] = val
      else # is "unselect"!
        for attr in event.attrs
          attrs[attr] = null
      retain = event.from.getPosition()
      selection_length = event.to.getPosition()-event.from.getPosition()
      @editor.updateContents
        ops: [
          {retain: retain},
          {retain: selection_length, attributes: attrs}
        ]

    # update the editor when the cursor is moved
    @_model.getContent("cursors").observe (events)=> @locker.try ()=>
      for event in events
        author = event.changedBy
        ref_to_char = event.object.val(author)
        if ref_to_char is null
          position = @editor.getLength()
        else if ref_to_char?
          position = ref_to_char.getPosition()
        else
          console.warn "ref_to_char is undefined"
          return

        params =
          id: author
          index: position
          text: author
          color: "grey"
        @editor.setCursor params

  # Apply a delta and return the new position
  # @param delta [Object] a *single* delta (see ot-types for more info)
  # @param position [Integer] start position for the delta, default: 0
  #
  # @return [Integer] the position of the cursor after parsing the delta
  deltaHelper = (thisObj, delta, position = 0) ->
    if delta?
      selections = thisObj._model.getContent("selections")
      delta_unselections = []
      delta_selections = {}
      for n,v of delta.attributes
        if v?
          delta_selections[n] = v
        else
          delta_unselections.push n

      if delta.insert?
        insertHelper thisObj, position, delta.insert
        from = thisObj._model.getContent("characters").ref position
        to = thisObj._model.getContent("characters").ref(
          position+delta.insert.length)
        thisObj._model.getContent("selections").select(
          from, to, delta_selections)
        thisObj._model.getContent("selections").unselect(
          from, to, delta_unselections)

        return position + delta.insert.length

      else if delta.delete?
        deleteHelper thisObj, position, delta.delete
        return position

      else if delta.retain?
        retain = parseInt delta.retain
        from = thisObj._model.getContent("characters").ref(position)
        to = thisObj._model.getContent("characters").ref(position + retain)

        thisObj._model.getContent("selections").select(
          from, to, delta_selections)
        thisObj._model.getContent("selections").unselect(
          from, to, delta_unselections)

        return position + retain
      throw new Error "This part of code must not be reached!"

  insertHelper = (thisObj, position, content) ->
    as_array =
      if typeof content is "string"
        content.split("")
      else if typeof content is "number"
        [content]
    if as_array?
      thisObj._model.getContent("characters").insertContents position, as_array

  deleteHelper = (thisObj, position, length = 1) ->
    thisObj._model.getContent("characters").delete position, length

if window?
  if window.Y?
    window.Y.RichText = YRichText
  else
    throw new Error "You must first import Y!"

if module?
  module.exports = YRichText
