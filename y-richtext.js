!function t(e,r,o){function n(i,u){if(!r[i]){if(!e[i]){var c="function"==typeof require&&require;if(!u&&c)return c(i,!0);if(s)return s(i,!0);throw new Error("Cannot find module '"+i+"'")}var l=r[i]={exports:{}};e[i][0].call(l.exports,function(t){var r=e[i][1][t];return n(r?r:t)},l,l.exports,t,e,r,o)}return r[i].exports}for(var s="function"==typeof require&&require,i=0;i<o.length;i++)n(o[i]);return n}({1:[function(t,e,r){var o,n,s,i,u={}.hasOwnProperty,c=function(t,e){function r(){this.constructor=t}for(var o in e)u.call(e,o)&&(t[o]=e[o]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t};n=t("./misc.coffee").Locker,o=function(){function t(t){this.editor=t,this.locker=new n}return t.prototype.getContents=function(){throw new Error("Implement me")},t.prototype.getCursor=function(){throw new Error("Implement me")},t.prototype.setCursor=function(t){throw new Error("Implement me")},t.prototype.observeLocalText=function(t){throw new Error("Implement me")},t.prototype.observeLocalCursor=function(t){throw new Error("Implement me")},t.prototype.updateContents=function(t){throw new Error("Implement me")},t}(),s=function(t){function e(t){this.editor=t,e.__super__.constructor.call(this,this.editor),this._cursors=this.editor.getModule("multi-cursor")}return c(e,t),e.prototype.getCursorPosition=function(){var t;return t=this.editor.getSelection(),t?t.start:0},e.prototype.getContents=function(){return this.editor.getContents()},e.prototype.setCursor=function(t){return this.locker["try"](t,function(t){return function(e){return t._cursors.setCursor(e.id,e.index,e.text,e.color)}}(this))},e.prototype.observeLocalText=function(t){return this.locker["try"](t,function(t){return function(e){return t.editor.on("text-change",function(t,r){return e(t.ops)})}}(this))},e.prototype.observeLocalCursor=function(t){return this.locker["try"](t,function(t){return function(e){return t.editor.on("selection-change",function(t,r){return t&&t.start===t.end?(e(t.start),console.log(t.start)):void 0})}}(this))},e.prototype.updateContents=function(t){return this.locker["try"](t,function(t){return function(e){return t.editor.updateContents(e)}}(this))},e}(o),i=function(t){function e(t){this.editor=t,e.__super__.constructor.apply(this,arguments)}return c(e,t),e.prototype.getCursorPosition=function(){return 0},e.prototype.getContents=function(){return{ops:[{insert:"Well, this is a test!"},{insert:"And I'm bold…",attributes:{bold:!0}}]}},e.prototype.setCursor=function(){return""},e.prototype.observeLocalText=function(t){return""},e.prototype.observeLocalCursor=function(t){return""},e.prototype.updateContents=function(t){return""},e}(o),r.QuillJs=s,r.TestEditor=i},{"./misc.coffee":2}],2:[function(t,e,r){var o,n,s=[].slice;n=function(){function t(){this.is_locked=!1}return t.prototype["try"]=function(){var t,e,r,o;return t=2<=arguments.length?s.call(arguments,0,o=arguments.length-1):(o=0,[]),e=arguments[o++],this.is_locked?void 0:(this.is_locked=!0,r=e.apply(null,t),this.is_locked=!1,r)},t}(),o=function(){function t(){this._tmp_model={}}return t.prototype._get=function(t){return null==this._model?this._tmp_model[t]:this._model.val(t)},t.prototype._set=function(t,e){return null==this._model?this._tmp_model[t]=e:this._model.val(t,e)},t.prototype._getModel=function(t,e){var r,o,n;if(null==this._model){this._model=new e.MapManager(this).execute(),n=this._tmp_model;for(r in n)o=n[r],this._model.val(r,o)}return this._model},t.prototype._setModel=function(t){return this._model=t,delete this._tmp_model},t}(),"undefined"!=typeof e&&null!==e&&(r.BaseClass=o,r.Locker=n)},{}],3:[function(t,e,r){var o,n,s,i,u=function(t,e){return function(){return t.apply(e,arguments)}},c={}.hasOwnProperty,l=function(t,e){function r(){this.constructor=t}for(var o in e)c.call(e,o)&&(t[o]=e[o]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t};if(o=t("./misc.coffee").BaseClass,s=t("./misc.coffee").Locker,n=t("./editors.coffee"),i=function(t){function e(){this.updateCursorPosition=u(this.updateCursorPosition,this),this.passDeltas=u(this.passDeltas,this),this.locker=new s}var r,o,i;return l(e,t),e.prototype.bind=function(t,e){var r,o,s,i,u,c,l,p;if(r=n[t],null!=r){for(this.editor=new r(e),this.editor.editor.deleteText(0,this.editor.editor.getText().length),this.editor.updateContents({ops:[{insert:this._get("characters").val().join("")}]}),o=0,u=[],p=this._get("selections").getSelections(this._get("characters")),c=0,l=p.length;l>c;c++)s=p[c],i=s.to-s.from,o!==s.from&&u.push({retain:s.from-o}),u.push({retain:i,attributes:s.attrs}),o+=i;return this.editor.updateContents({ops:u}),this.editor.observeLocalText(this.passDeltas),this.bindEventsToEditor(this.editor),this.editor.observeLocalCursor(this.updateCursorPosition)}throw new Error("This type of editor is not supported!")},e.prototype._getModel=function(t,r){return null==this._model&&(e.__super__._getModel.apply(this,arguments),this._set("selections",new t.Selections),this._set("characters",new t.List),this._set("cursors",new t.Object),this._setModel(this._model),this._model.observe(this.propagateToEditor)),this._model},e.prototype._setModel=function(t){return e.__super__._setModel.apply(this,arguments)},e.prototype._name="RichText",e.prototype.setCursor=function(t){return this.selfCursor=this._get("characters").ref(t),this._get("cursors").val(this._model.HB.getUserId(),this.selfCursor)},e.prototype.passDeltas=function(t){return this.locker["try"](t,function(t){return function(e){var r,n,s,i,u;for(n=0,u=[],s=0,i=e.length;i>s;s++)r=e[s],u.push(n=o(t,r,n));return u}}(this))},e.prototype.updateCursorPosition=function(t){return this.locker["try"](t,function(t){return function(e){return t.selfCursor="number"==typeof e?t._get("characters").ref(e):e,t._get("cursors").val(t._model.HB.getUserId(),t.selfCursor)}}(this))},e.prototype.bindEventsToEditor=function(t){return this._get("characters").observe(function(t){return function(e){return t.locker["try"](e,function(e){var r,o,n,s,i;for(i=[],n=0,s=e.length;s>n;n++)o=e[n],r={ops:[{retain:o.position}]},"insert"===o.type?r.ops.push({insert:o.value}):"delete"===o.type&&r.ops.push({"delete":1}),i.push(t.editor.updateContents(r));return i})}}(this)),this._get("selections").observe(function(t){return function(e){return t.locker["try"](e,function(e){var r,o,n,s,i,u,c,l,p;if(o={},"select"===e.type){l=e.attrs;for(r in l)i=l[r],o[r]=i}else for(p=e.attrs,u=0,c=p.length;c>u;u++)r=p[u],o[r]=null;return n=e.from.getPosition(),s=e.to.getPosition()-e.from.getPosition(),t.editor.updateContents({ops:[{retain:n},{retain:s,attributes:o}]})})}}(this)),this._get("cursors").observe(function(t){return function(e){return t.locker["try"](e,function(e){var r,o,n,s,i,u,c;for(c=[],i=0,u=e.length;u>i;i++)o=e[i],r=o.changedBy,s=o.object.val(r),null!==s?(n={id:r,index:o.object.val(r).getPosition(),text:r,color:"grey"},c.push(t.editor.setCursor(n))):c.push(void 0);return c})}}(this))},o=function(t,e,o){var n,s,u,c,l,p,f,h,a;if(null==o&&(o=0),null!=e){p=t._get("selections"),s=[],n={},a=e.attributes;for(c in a)h=a[c],null!=h?n[c]=h:s.push(c);if(null!=e.insert)return i(t,o,e.insert),u=t._get("characters").ref(o),f=t._get("characters").ref(o+e.insert.length),t._get("selections").select(u,f,n),t._get("selections").unselect(u,f,s),o+e.insert.length;if(null!=e["delete"])return r(t,o,e["delete"]),o;if(null!=e.retain)return l=parseInt(e.retain),u=t._get("characters").ref(o),f=t._get("characters").ref(o+l),t._get("selections").select(u,f,n),t._get("selections").unselect(u,f,s),o+l;throw new Error("This part of code must not be reached!")}},i=function(t,e,r){var o;return o="string"==typeof r?r.split(""):"number"==typeof r?[r]:void 0,null!=o?t._get("characters").insertContents(e,o):void 0},r=function(t,e,r){return null==r&&(r=1),t._get("characters")["delete"](e,r)},e}(o),"undefined"!=typeof window&&null!==window){if(null==window.Y)throw new Error("You must first import Y!");window.Y.RichText=i}"undefined"!=typeof e&&null!==e&&(e.exports=i)},{"./editors.coffee":1,"./misc.coffee":2}]},{},[3]);