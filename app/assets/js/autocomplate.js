window.VueAutoComplete = ({
  props: {
    id: String,
    name: String,
    className: String,
    classes: {
      type: Object,
      default: function _default() {
        return {
          wrapper: false,
          input: false,
          list: false,
          item: false
        };
      }
    },
    placeholder: String,
    required: Boolean,

    // Intial Value
    initValue: {
      type: String,
      default: ""
    },

    // Manual List
    options: Array,

    // Filter After Get the data
    filterByAnchor: {
      type: Boolean,
      default: true
    },

    // Anchor of list
    anchor: {
      type: String,
      required: true
    },

    // Label of list
    label: String,

    // Debounce time
    debounce: Number,

    // ajax URL will be fetched
    url: {
      type: String,
      required: true
    },

    // query param
    param: {
      type: String,
      default: 'q'
    },

    encodeParams: {
      type: Boolean,
      default: true
    },

    // Custom Params
    customParams: Object,

    // Custom Headers
    customHeaders: Object,

    // minimum length
    min: {
      type: Number,
      default: 0
    },

    // Create a custom template from data.
    onShouldRenderChild: Function,

    // Process the result before retrieveng the result array.
    process: Function,

    // Callback
    onInput: Function,
    onShow: Function,
    onBlur: Function,
    onHide: Function,
    onFocus: Function,
    onSelect: Function,
    onBeforeAjax: Function,
    onAjaxProgress: Function,
    onAjaxLoaded: Function,
    onShouldGetData: Function
  },

  data: function data() {
    return {
      showList: false,
      type: "",
      json: [],
      focusList: "",
      debounceTask: undefined
    };
  },


  watch: {
    options: function options(newVal, oldVal) {
      if (this.filterByAnchor) {
        var type = this.type,
            anchor = this.anchor;

        var regex = new RegExp("" + type, 'i');
        var filtered = newVal.filter(function (item) {
          var found = item[anchor].search(regex) !== -1;
          return found;
        });
        this.json = filtered;
      } else {
        this.json = newVal;
      }
    }
  },

  methods: {
    getClassName: function getClassName(part) {
      var classes = this.classes,
          className = this.className;

      if (classes[part]) return "" + classes[part];
      return className ? className + "-" + part : '';
    },


    // Netralize Autocomplete
    clearInput: function clearInput() {
      this.showList = false;
      this.type = "";
      this.json = [];
      this.focusList = "";
    },


    // Get the original data
    cleanUp: function cleanUp(data) {
      return JSON.parse(JSON.stringify(data));
    },


    /*==============================
      INPUT EVENTS
    =============================*/
    handleInput: function handleInput(e) {
      var _this = this;

      var value = e.target.value;

      this.showList = true;
      // Callback Event
      this.$emit('input', value)
      if (this.onInput) this.onInput(value);
      // If Debounce
      if (this.debounce) {
        if (this.debounceTask !== undefined) clearTimeout(this.debounceTask);
        this.debounceTask = setTimeout(function () {
          return _this.getData(value);
        }, this.debounce);
      } else {
        return this.getData(value);
      }
    },
    handleKeyDown: function handleKeyDown(e) {
      var key = e.keyCode;

      // Disable when list isn't showing up
      if (!this.showList) return;

      // Key List
      var DOWN = 40;
      var UP = 38;
      var ENTER = 13;
      var ESC = 27;

      // Prevent Default for Prevent Cursor Move & Form Submit
      switch (key) {
        case DOWN:
          e.preventDefault();
          this.focusList++;
          break;
        case UP:
          e.preventDefault();
          this.focusList--;
          break;
        case ENTER:
          e.preventDefault();
          this.selectList(this.json[this.focusList]);
          this.showList = false;
          break;
        case ESC:
          this.showList = false;
          break;
      }

      var listLength = this.json.length - 1;
      var outOfRangeBottom = this.focusList > listLength;
      var outOfRangeTop = this.focusList < 0;
      var topItemIndex = 0;
      var bottomItemIndex = listLength;

      var nextFocusList = this.focusList;
      if (outOfRangeBottom) nextFocusList = topItemIndex;
      if (outOfRangeTop) nextFocusList = bottomItemIndex;
      this.focusList = nextFocusList;
    },
    setValue: function setValue(val) {
      this.type = val;
    },


    /*==============================
      LIST EVENTS
    =============================*/

    handleDoubleClick: function handleDoubleClick() {
      this.json = [];
      this.getData("");
      // Callback Event
      this.$emit('show')
      this.onShow ? this.onShow() : null;
      this.showList = true;
    },
    handleBlur: function handleBlur(e) {
      var _this2 = this;

      // Callback Event
      this.onBlur ? this.onBlur(e) : null;
      this.$emit('blur', e)
      setTimeout(function () {
        // Callback Event
        _this2.$emit('hide')
        _this2.onHide ? _this2.onHide() : null;
        _this2.showList = false;
      }, 250);
    },
    handleFocus: function handleFocus(e) {
      this.focusList = 0;
      this.$emit('focus', e)
      // Callback Event
      this.onFocus ? this.onFocus(e) : null;
    },
    mousemove: function mousemove(i) {
      this.focusList = i;
    },
    activeClass: function activeClass(i) {
      var focusClass = i === this.focusList ? 'focus-list' : '';
      return "" + focusClass;
    },
    selectList: function selectList(data) {
      // Deep clone of the original object
      var clean = this.cleanUp(data);
      // Put the selected data to type (model)
      this.type = clean[this.anchor];
      // Hide List
      this.showList = false;
      // Callback Event
      this.$emit('select', clean)
      this.onSelect ? this.onSelect(clean) : null;
    },
    deepValue: function deepValue(obj, path) {
      var arrayPath = path.split('.');
      for (var i = 0; i < arrayPath.length; i++) {
        obj = obj[arrayPath[i]];
      }
      return obj;
    },


    /*==============================
      AJAX EVENTS
    =============================*/

    composeParams: function composeParams(val) {
      var _this3 = this;

      var encode = function encode(val) {
        return _this3.encodeParams ? encodeURIComponent(val) : val;
      };
      var params = this.param + "=" + encode(val);
      if (this.customParams) {
        Object.keys(this.customParams).forEach(function (key) {
          params += "&" + key + "=" + encode(_this3.customParams[key]);
        });
      }
      return params;
    },
    composeHeader: function composeHeader(ajax) {
      var _this4 = this;

      if (this.customHeaders) {
        Object.keys(this.customHeaders).forEach(function (key) {
          ajax.setRequestHeader(key, _this4.customHeaders[key]);
        });
      }
    },
    doAjax: function doAjax(val) {
      var _this5 = this;

      // Callback Event
      this.$emit('beforeAjax', val)
      this.onBeforeAjax ? this.onBeforeAjax(val) : null;
      // Compose Params
      var params = this.composeParams(val);
      // Init Ajax
      var ajax = new XMLHttpRequest();
      ajax.open('GET', this.url + "?" + params, true);
      this.composeHeader(ajax);
      // Callback Event
      ajax.addEventListener('progress', function (data) {
        this.$emit('ajaxProgress', data)
        if (data.lengthComputable && _this5.onAjaxProgress) _this5.onAjaxProgress(data);
      });
      // On Done
      ajax.addEventListener('loadend', function (e) {
        var responseText = e.target.responseText;

        var json = JSON.parse(responseText);
        // Callback Event
        this.$emit('ajaxLoaded', json)
        _this5.onAjaxLoaded ? _this5.onAjaxLoaded(json) : null;
        _this5.json = _this5.process ? _this5.process(json) : json;
      });
      // Send Ajax
      ajax.send();
    },
    getData: function getData(value) {
      if (value.length < this.min || !this.url) return;
      if (this.onShouldGetData) this.manualGetData(value);else this.doAjax(value);
    },


    // Do Ajax Manually, so user can do whatever he want
    manualGetData: function manualGetData(val) {
      var _this6 = this;

      var task = this.onShouldGetData(val);
      if (task && task.then) {
        return task.then(function (options) {
          _this6.json = options;
        });
      }
    }
  },

  created: function created() {
    // Sync parent model with initValue Props
    this.type = this.initValue ? this.initValue : null;
  },
  mounted: function mounted() {
    if (this.required) this.$refs.input.setAttribute("required", this.required);
  },
  render:function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    class: ((_vm.getClassName('wrapper')) + " autocomplete-wrapper")
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.type),
      expression: "type"
    }],
    ref: "input",
    class: ((_vm.getClassName('input')) + " autocomplete-input"),
    attrs: {
      "type": "text",
      "id": _vm.id,
      "placeholder": _vm.placeholder,
      "name": _vm.name,
      "autocomplete": "off"
    },
    domProps: {
      "value": (_vm.type)
    },
    on: {
      "input": [function($event) {
        if ($event.target.composing) { return; }
        _vm.type = $event.target.value
      }, _vm.handleInput],
      "dblclick": _vm.handleDoubleClick,
      "blur": _vm.handleBlur,
      "keydown": _vm.handleKeyDown,
      "focus": _vm.handleFocus
    }
  }), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.showList && _vm.json.length),
      expression: "showList && json.length"
    }],
    class: ((_vm.getClassName('list')) + " autocomplete autocomplete-list")
  }, [_c('ul', _vm._l((_vm.json), function(data, i) {
    return _c('li', {
      class: _vm.activeClass(i)
    }, [_c('a', {
      attrs: {
        "href": "#"
      },
      on: {
        "click": function($event) {
          $event.preventDefault();
          _vm.selectList(data)
        },
        "mousemove": function($event) {
          _vm.mousemove(i)
        }
      }
    }, [(_vm.onShouldRenderChild) ? _c('div', {
      domProps: {
        "innerHTML": _vm._s(_vm.onShouldRenderChild(data))
      }
    }) : _vm._e(), _vm._v(" "), (!_vm.onShouldRenderChild) ? _c('div', [_c('b', {
      staticClass: "autocomplete-anchor-text"
    }, [_vm._v(_vm._s(_vm.deepValue(data, _vm.anchor)))]), _vm._v(" "), _c('span', {
      staticClass: "autocomplete-anchor-label"
    }, [_vm._v(_vm._s(_vm.deepValue(data, _vm.label)))])]) : _vm._e()])])
  }))])])
}
})