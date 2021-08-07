// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (typeof console !== 'undefined') {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      assert(sig.length == 1);
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math.abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math.min(Math.floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0
}
Module['stringToUTF32'] = stringToUTF32;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i)
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
var memoryInitializer = null;
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 1800;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stderr;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,4,0,0,0,0,0,0,78,111,116,70,111,117,110,100,69,120,99,101,112,116,105,111,110,0,0,0,0,0,0,0,73,108,108,101,103,97,108,65,114,103,69,120,99,101,112,116,105,111,110,0,0,0,0,0,71,101,110,101,114,97,108,108,121,69,120,99,101,112,116,105,111,110,0,0,0,0,0,0,65,115,115,101,114,116,69,120,99,101,112,116,105,111,110,0,47,115,99,114,97,116,99,104,47,111,112,116,47,112,111,115,116,105,97,116,115,47,112,114,101,108,117,100,101,47,83,65,84,83,47,97,114,114,97,121,46,115,97,116,115,58,65,114,114,97,121,83,117,98,115,99,114,105,112,116,69,120,110,0,47,115,99,114,97,116,99,104,47,111,112,116,47,112,111,115,116,105,97,116,115,47,100,111,99,47,80,82,79,74,69,67,84,47,77,69,68,73,85,77,47,65,108,103,111,114,105,97,110,105,109,47,113,117,105,99,107,115,111,114,116,47,113,117,105,99,107,115,111,114,116,95,97,110,105,109,46,100,97,116,115,58,32,56,57,48,50,40,108,105,110,101,61,52,51,57,44,32,111,102,102,115,61,49,48,41,32,45,45,32,56,57,49,56,40,108,105,110,101,61,52,51,57,44,32,111,102,102,115,61,50,54,41,0,0,0,101,120,105,116,40,65,84,83,41,58,32,97,116,115,114,117,110,116,105,109,101,95,109,97,108,108,111,99,95,108,105,98,99,95,101,120,110,58,32,91,109,97,108,108,111,99,93,32,102,97,105,108,101,100,46,10,0,0,0,0,0,0,0,0,47,115,99,114,97,116,99,104,47,111,112,116,47,112,111,115,116,105,97,116,115,47,100,111,99,47,80,82,79,74,69,67,84,47,77,69,68,73,85,77,47,65,108,103,111,114,105,97,110,105,109,47,113,117,105,99,107,115,111,114,116,47,113,117,105,99,107,115,111,114,116,95,97,110,105,109,46,100,97,116,115,58,32,50,48,53,55,40,108,105,110,101,61,49,50,51,44,32,111,102,102,115,61,49,48,41,32,45,45,32,50,48,55,51,40,108,105,110,101,61,49,50,51,44,32,111,102,102,115,61,50,54,41,0,0,0,114,103,98,40,50,53,53,44,32,48,44,32,48,41,0,0,114,103,98,40,50,48,48,44,32,50,48,48,44,32,50,48,48,41,0,0,0,0,0,0,35,70,70,70,70,70,70,0,47,115,99,114,97,116,99,104,47,111,112,116,47,112,111,115,116,105,97,116,115,47,100,111,99,47,80,82,79,74,69,67,84,47,77,69,68,73,85,77,47,65,108,103,111,114,105,97,110,105,109,47,113,117,105,99,107,115,111,114,116,47,113,117,105,99,107,115,111,114,116,95,97,110,105,109,46,100,97,116,115,58,32,55,54,51,51,40,108,105,110,101,61,51,57,53,44,32,111,102,102,115,61,50,50,41,32,45,45,32,55,54,54,48,40,108,105,110,101,61,51,57,53,44,32,111,102,102,115,61,52,57,41,0,0,0,81,117,105,99,107,115,111,114,116,65,110,105,109,0,0,0,37,115,0,0,0,0,0,0,101,120,105,116,40,65,84,83,41,58,32,91,102,112,114,105,110,116,95,110,101,119,108,105,110,101,93,32,102,97,105,108,101,100,46,0,0,0,0,0,10,0,0,0,0,0,0,0,114,103,98,97,40,48,44,32,48,44,32,48,44,32,48,46,49,41,0,0,0,0,0,0,58,32,73,108,108,101,103,97,108,65,114,103,69,120,110,58,32,0,0,0,0,0,0,0,58,32,71,101,110,101,114,97,108,108,121,69,120,110,58,32,0,0,0,0,0,0,0,0,58,32,78,111,116,70,111,117,110,100,69,120,110,0,0,0,58,32,65,115,115,101,114,116,69,120,110,0,0,0,0,0,101,120,105,116,40,65,84,83,41,58,32,117,110,99,97,117,103,104,116,32,101,120,99,101,112,116,105,111,110,32,97,116,32,114,117,110,45,116,105,109,101,0,0,0,0,0,0,0,101,120,105,116,40,65,84,83,41,58,32,117,110,99,97,117,103,104,116,32,101,120,99,101,112,116,105,111,110,32,97,116,32,114,117,110,45,116,105,109,101,58,32,37,115,40,37,100,41,10,0,0,0,0,0,0,101,120,105,116,40,65,84,83,41,58,32,117,110,109,97,116,99,104,101,100,32,118,97,108,117,101,32,97,116,32,114,117,110,45,116,105,109,101,58,10,37,115,10,0,0,0,0,0,65,114,114,97,121,83,117,98,115,99,114,105,112,116,69,120,99,101,112,116,105,111,110,0,35,48,48,48,48,70,70,0,47,115,99,114,97,116,99,104,47,111,112,116,47,112,111,115,116,105,97,116,115,47,100,111,99,47,80,82,79,74,69,67,84,47,77,69,68,73,85,77,47,65,108,103,111,114,105,97,110,105,109,47,113,117,105,99,107,115,111,114,116,47,113,117,105,99,107,115,111,114,116,95,97,110,105,109,46,100,97,116,115,58,32,51,50,54,55,40,108,105,110,101,61,49,56,55,44,32,111,102,102,115,61,55,41,32,45,45,32,51,50,57,53,40,108,105,110,101,61,49,56,55,44,32,111,102,102,115,61,51,53,41,0,0,0,0,40,0,0,0,16,0,0,0,30,0,0,0,40,0,0,0,20,0,0,0,64,0,0,0,10,0,0,0,88,0,0,0,60,0,0,0,248,3,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var MyCanvas={objcnt:0,contexts:{},objadd:function (obj) {
  	    var idx = ++MyCanvas.objcnt;
  	    MyCanvas.contexts[idx] = obj;
  	    return idx;
  	}};function _atscntrb_html5_canvas2d_save(idx) { MyCanvas.contexts[idx].save(); }
  function _atscntrb_html5_canvas2d_scale(idx, sx, sy) {
          MyCanvas.contexts[idx].scale(sx, sy);
      }
  function _atscntrb_html5_canvas2d_beginPath(idx) { MyCanvas.contexts[idx].beginPath(); }
  function _atscntrb_html5_canvas2d_moveTo(idx, x, y) { MyCanvas.contexts[idx].moveTo(x, y); }
  function _atscntrb_html5_canvas2d_lineTo(idx, x, y) { MyCanvas.contexts[idx].lineTo(x, y); }
  function _atscntrb_html5_canvas2d_set_lineWidth_double(idx, width) {
          MyCanvas.contexts[idx].lineWidth = width ;
      }
  function _atscntrb_html5_canvas2d_set_strokeStyle_string(idx, style) {
          MyCanvas.contexts[idx].strokeStyle = Pointer_stringify(style);
      }
  function _atscntrb_html5_canvas2d_stroke(idx) { MyCanvas.contexts[idx].stroke(); }
  function _atscntrb_html5_canvas2d_closePath(idx) { MyCanvas.contexts[idx].closePath(); }
  function _atscntrb_html5_canvas2d_restore(idx) { MyCanvas.contexts[idx].restore(); }
  function _atscntrb_html5_canvas2d_set_fillStyle_string(idx, style) {
          MyCanvas.contexts[idx].fillStyle = Pointer_stringify(style);
      }
  function _atscntrb_html5_canvas2d_fillRect(idx, xul, yul, width, height) {
          MyCanvas.contexts[idx].fillRect(xul, yul, width, height);
      }
  function _JS_window_requestAnimationFrame(ptr)
      {
          var func =
  	    Runtime.getFuncWrapper(ptr, 'vi');
          var _requestAnimationFrame =
  	    window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.msRequestAnimationFrame;
          _requestAnimationFrame(func);
      }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var VFS=undefined;
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },mount:function (mount) {
        return MEMFS.create_node(null, '/', 16384 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek
          };
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap
          };
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          };
          node.stream_ops = {};
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && buffer.buffer === HEAP8.buffer && offset === 0) {
              node.contents = buffer; // this is a subarray of the heap, and we can own it
              node.contentMode = MEMFS.CONTENT_OWNING;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        // NOTE we must use Object.defineProperties instead of individual calls to
        // Object.defineProperty in order to make closure compiler happy
        Object.defineProperties(node, {
          read: {
            get: function() { return (node.mode & readMode) === readMode; },
            set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
          },
          write: {
            get: function() { return (node.mode & writeMode) === writeMode; },
            set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
          },
          isFolder: {
            get: function() { return FS.isDir(node.mode); },
          },
          isDevice: {
            get: function() { return FS.isChrdev(node.mode); },
          },
        });
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperties(stream, {
          object: {
            get: function() { return stream.node; },
            set: function(val) { stream.node = val; }
          },
          isRead: {
            get: function() { return (stream.flags & 2097155) !== 1; }
          },
          isWrite: {
            get: function() { return (stream.flags & 2097155) !== 0; }
          },
          isAppend: {
            get: function() { return (stream.flags & 1024); }
          }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 131072)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(path, mode | 146);
          var stream = FS.open(path, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {} : ['binary'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          var handleMessage = function(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module.print('exit(' + status + ') called');
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }
  function _longjmp(env, value) {
      throw { longjmp: true, id: HEAP32[((env)>>2)], value: value || 1 };
    }
  function _JS_Math_random() { return Math.random(); }
  function _atscntrb_html5_canvas2d_make(id) {
  	var idx = 0;
  	var id2 = Pointer_stringify(id);
          var canvas = document.getElementById(id2);
          if(!canvas) return 0;
          if(canvas.getContext)
  	{
  	    idx = MyCanvas.objadd(canvas.getContext("2d"));
          } else {
              throw "atscntrb_html5_canvas2d: 2D-canvas is not supported";
          }
          return idx ; 
      }
  var MyDocument={objcnt:0,contexts:{},objadd:function (obj) {
  	    var idx = ++MyDocument.objcnt;
  	    MyDocument.contexts[idx] = obj;
  	    return idx;
  	}};function _atscntrb_html_document_get_documentElement_clientWidth() { return document.documentElement.clientWidth; }
  function _atscntrb_html_document_get_documentElement_clientHeight() { return document.documentElement.clientHeight; }
  function _JS_canvas2d_set_size_int(id, width, height) {
          var id2 = Pointer_stringify(id)
          var elt = document.getElementById(id2);
          if(elt)
  	{
  	    elt.width = width; elt.height = height;
  	}
  	return ;
      }
  function _atscntrb_html5_canvas2d_clearRect(idx, xul, yul, width, height) {
          MyCanvas.contexts[idx].clearRect(xul, yul, width, height);
      }
  function _atscntrb_html5_canvas2d_free(idx) { delete MyCanvas.contexts[idx]; }
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,___patsfun_291];
// EMSCRIPTEN_START_FUNCS
// WARNING: content after a branch in a label, line: 56
// WARNING: content after a branch in a label, line: 366
// WARNING: content after a branch in a label, line: 716
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_pop() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret49;
   var $tmp50;
   var $tmp51;
   label = 2; break;
  case 2: 
   var $2=HEAP32[((1296)>>2)];
   var $3=$2;
   var $4=HEAP32[(($3)>>2)];
   var $5=0==(($4)|(0));
   if ($5) { label = 3; break; } else { label = 4; break; }
  case 3: 
   _atsruntime_handle_unmatchedval(((1048)|0));
   label = 4; break;
  case 4: 
   var $8=HEAP32[((1296)>>2)];
   var $9=$8;
   var $10=HEAP32[(($9)>>2)];
   var $11=$10;
   var $12=(($11)|0);
   var $13=HEAP32[(($12)>>2)];
   $tmp50=$13;
   var $14=HEAP32[((1296)>>2)];
   var $15=$14;
   var $16=HEAP32[(($15)>>2)];
   var $17=$16;
   var $18=(($17+4)|0);
   var $19=HEAP32[(($18)>>2)];
   $tmp51=$19;
   label = 5; break;
  case 5: 
   label = 6; break;
  case 6: 
   var $22=$tmp51;
   var $23=0==(($22)|(0));
   if ($23) { label = 7; break; } else { label = 8; break; }
  case 7: 
   label = 10; break;
  case 8: 
   label = 9; break;
  case 9: 
   var $27=$tmp51;
   var $28=HEAP32[((1296)>>2)];
   var $29=$28;
   HEAP32[(($29)>>2)]=$27;
   label = 11; break;
  case 10: 
   var $32=HEAP32[((1280)>>2)];
   var $33=$32;
   HEAP32[(($33)>>2)]=0;
   label = 11; break;
  case 11: 
   var $35=$tmp50;
   $tmpret49=$35;
   var $36=$tmpret49;
   return $36;
  default: assert(0, "bad label: " + label);
 }
}
function _atsruntime_handle_unmatchedval($msg0) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1;
 $1=$msg0;
 var $2=HEAP32[((_stderr)>>2)];
 var $3=$1;
 var $4=_fprintf($2, ((968)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$3,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 STACKTOP = sp;
 return;
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_push($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmp54;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=_atsruntime_malloc_libc_exn(8);
   $tmp54=$3;
   var $4=$1;
   var $5=$tmp54;
   var $6=$5;
   var $7=(($6)|0);
   HEAP32[(($7)>>2)]=$4;
   var $8=HEAP32[((1296)>>2)];
   var $9=$8;
   var $10=HEAP32[(($9)>>2)];
   var $11=$tmp54;
   var $12=$11;
   var $13=(($12+4)|0);
   HEAP32[(($13)>>2)]=$10;
   var $14=$tmp54;
   var $15=HEAP32[((1296)>>2)];
   var $16=$15;
   HEAP32[(($16)>>2)]=$14;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _atsruntime_malloc_libc_exn($bsz) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $p;
   $1=$bsz;
   var $2=$1;
   var $3=_atsruntime_malloc_libc($2);
   $p=$3;
   var $4=$p;
   var $5=(($4)|(0))!=0;
   if ($5) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $7=HEAP32[((_stderr)>>2)];
   var $8=_fprintf($7, ((304)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   _exit(1);
   throw "Reached an unreachable!";
  case 3: 
   var $10=$p;
   STACKTOP = sp;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_reverse() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmp56;
   label = 2; break;
  case 2: 
   var $2=HEAP32[((1296)>>2)];
   var $3=$2;
   var $4=HEAP32[(($3)>>2)];
   var $5=_ATSLIB_056_libats_056_ML__list0_reverse__15__1($4);
   $tmp56=$5;
   var $6=$tmp56;
   var $7=HEAP32[((1296)>>2)];
   var $8=$7;
   HEAP32[(($8)>>2)]=$6;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__list0_reverse__15__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret57__1;
   var $tmp58__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   $tmp58__1=0;
   var $3=$1;
   var $4=$tmp58__1;
   var $5=_ATSLIB_056_libats_056_ML__list0_reverse_append__17__1($3, $4);
   $tmpret57__1=$5;
   var $6=$tmpret57__1;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_hasmore() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret79;
   label = 2; break;
  case 2: 
   var $2=HEAP32[((1280)>>2)];
   var $3=$2;
   var $4=HEAP32[(($3)>>2)];
   $tmpret79=$4;
   var $5=$tmpret79;
   return $5;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePartition_get($agg_result) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret96=sp;
   label = 2; break;
  case 2: 
   var $2=HEAP32[((1256)>>2)];
   var $3=$2;
   var $4=$tmpret96;
   var $5=$3;
   assert(8 % 1 === 0);HEAP32[(($4)>>2)]=HEAP32[(($5)>>2)];HEAP32[((($4)+(4))>>2)]=HEAP32[((($5)+(4))>>2)];
   var $6=$agg_result;
   var $7=$tmpret96;
   assert(8 % 1 === 0);HEAP32[(($6)>>2)]=HEAP32[(($7)>>2)];HEAP32[((($6)+(4))>>2)]=HEAP32[((($7)+(4))>>2)];
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePartition_set($arg0) {
 var label = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $arg0; $arg0 = STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($arg0)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($arg0)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1) switch(label) {
  case 1: 
   label = 2; break;
  case 2: 
   var $2=HEAP32[((1256)>>2)];
   var $3=$2;
   var $4=$3;
   var $5=$arg0;
   assert(8 % 1 === 0);HEAP32[(($4)>>2)]=HEAP32[(($5)>>2)];HEAP32[((($4)+(4))>>2)]=HEAP32[((($5)+(4))>>2)];
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePivot_get() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret98;
   label = 2; break;
  case 2: 
   var $2=HEAP32[((1272)>>2)];
   var $3=$2;
   var $4=HEAP32[(($3)>>2)];
   $tmpret98=$4;
   var $5=$tmpret98;
   return $5;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePivot_set($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=HEAP32[((1272)>>2)];
   var $5=$4;
   HEAP32[(($5)>>2)]=$3;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__theNextRender_get() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret100;
   label = 2; break;
  case 2: 
   var $2=HEAP32[((1224)>>2)];
   var $3=$2;
   var $4=HEAPF64[(($3)>>3)];
   $tmpret100=$4;
   var $5=$tmpret100;
   return $5;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__theNextRender_incby($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmp102;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=HEAP32[((1224)>>2)];
   var $4=$3;
   var $5=HEAPF64[(($4)>>3)];
   var $6=$1;
   var $7=_atspre_g0float_add_double($5, $6);
   $tmp102=$7;
   var $8=$tmp102;
   var $9=HEAP32[((1224)>>2)];
   var $10=$9;
   HEAPF64[(($10)>>3)]=$8;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0float_add_double($f1, $f2) {
 var label = 0;
 var $1;
 var $2;
 $1=$f1;
 $2=$f2;
 var $3=$1;
 var $4=$2;
 var $5=($3)+($4);
 return $5;
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__intqsort($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmp612;
   var $tmp613;
   $1=$arg0;
   label = 2; break;
  case 2: 
   $tmp612=0;
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__array0_get_size__247__1($3);
   $tmp613=$4;
   var $5=$1;
   var $6=$tmp612;
   var $7=$tmp613;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__qsort__0__1($5, $6, $7);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_size__247__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret614__1;
   var $tmp615__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__19($3);
   $tmp615__1=$4;
   var $5=$tmp615__1;
   var $6=_ATSLIB_056_prelude__arrszref_get_size__250__1($5);
   $tmpret614__1=$6;
   var $7=$tmpret614__1;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__qsort__0__1($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $argx0;
   var $argx1;
   var $argx2;
   var $tmp1__1;
   var $tmp2__1;
   var $tmp4__1;
   var $tmp5__1;
   var $tmp6__1;
   var $tmp7__1;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$3;
   var $6=_ATSLIB_056_prelude__gte_g0uint_int__43__1($5, 2);
   $tmp1__1=$6;
   var $7=$tmp1__1;
   var $8=(($7)|(0))!=0;
   if ($8) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $10=$1;
   var $11=$2;
   var $12=$3;
   var $13=__057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__qsort_partition__3__1($10, $11, $12);
   $tmp2__1=$13;
   var $14=$1;
   var $15=$2;
   var $16=$tmp2__1;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__qsort__0__1($14, $15, $16);
   var $17=$3;
   var $18=$tmp2__1;
   var $19=_atspre_g0uint_sub_size($17, $18);
   $tmp4__1=$19;
   var $20=$2;
   var $21=$tmp2__1;
   var $22=_atspre_g0uint_add_size($20, $21);
   $tmp6__1=$22;
   var $23=$tmp6__1;
   var $24=_atspre_g0uint_succ_size($23);
   $tmp5__1=$24;
   var $25=$tmp4__1;
   var $26=_atspre_g0uint_pred_size($25);
   $tmp7__1=$26;
   label = 4; break;
  case 4: 
   var $28=$1;
   $argx0=$28;
   var $29=$tmp5__1;
   $argx1=$29;
   var $30=$tmp7__1;
   $argx2=$30;
   var $31=$argx0;
   $1=$31;
   var $32=$argx1;
   $2=$32;
   var $33=$argx2;
   $3=$33;
   label = 2; break;
  case 5: 
   label = 6; break;
  case 6: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__draw_array0($arg0, $arg1, $arg2, $arg3, $arg4, $arg5) {
 var label = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $arg4; $arg4 = STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($arg4)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($arg4)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $5;
   var $tmp624;
   var $tmp630;
   var $tmp631;
   var $tmp637;
   var $tmp638;
   var $tmp639;
   var $tmp640;
   var $tmp641;
   var $tmp687;
   var $tmp688;
   var $tmp689;
   var $tmp691;
   var $tmp696;
   var $tmp697;
   var $tmp721;
   var $tmp722;
   var $tmp723;
   var $tmp725;
   var $tmp726;
   var $tmp727;
   var $tmp728;
   var $tmp735;
   var $tmp736;
   var $tmp737;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   $4=$arg3;
   $5=$arg5;
   label = 2; break;
  case 2: 
   var $7=$2;
   var $8=_ATSLIB_056_libats_056_ML__array0_get_size__247__2($7);
   $tmp624=$8;
   var $9=$tmp624;
   $tmp630=$9;
   var $10=$2;
   var $11=_ATSLIB_056_libats_056_ML__array0_get_size__247__3($10);
   $tmp631=$11;
   var $12=$tmp631;
   $tmp637=$12;
   var $13=$3;
   var $14=_atspre_g0int2float_int_double($13);
   $tmp639=$14;
   var $15=$tmp639;
   var $16=$tmp637;
   var $17=(($16)>>>(0));
   var $18=_atspre_g0float_div_double($15, $17);
   $tmp638=$18;
   var $19=$4;
   var $20=_atspre_g0int2float_int_double($19);
   $tmp641=$20;
   var $21=$tmp641;
   var $22=_atspre_g0float_div_double($21, 165);
   $tmp640=$22;
   var $23=$1;
   _atscntrb_html5_canvas2d_save($23);
   var $24=$1;
   var $25=$tmp638;
   var $26=$tmp640;
   _atscntrb_html5_canvas2d_scale($24, $25, $26);
   $tmp687=0;
   var $27=$2;
   var $28=$5;
   var $29=$tmp630;
   var $30=$1;
   var $31=$tmp687;
   _loop_261($27, $28, $29, $30, $31);
   var $32=(($arg4)|0);
   var $33=HEAP32[(($32)>>2)];
   $tmp688=$33;
   var $34=(($arg4+4)|0);
   var $35=HEAP32[(($34)>>2)];
   $tmp689=$35;
   var $36=_atspre_g0int_neg_int(1);
   $tmp696=$36;
   var $37=$5;
   var $38=$tmp696;
   var $39=_ATSLIB_056_prelude__gt_g0int_int__277__1($37, $38);
   $tmp691=$39;
   var $40=$tmp691;
   var $41=(($40)|(0))!=0;
   if ($41) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $43=$2;
   var $44=$5;
   var $45=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__10($43, $44);
   $tmp697=$45;
   var $46=$1;
   _atscntrb_html5_canvas2d_save($46);
   var $47=$1;
   _atscntrb_html5_canvas2d_beginPath($47);
   var $48=$tmp688;
   var $49=_atspre_mul_double_int(1, $48);
   $tmp721=$49;
   var $50=$tmp697;
   var $51=_atspre_g0int_sub_int(165, $50);
   $tmp723=$51;
   var $52=$tmp723;
   var $53=_atspre_mul_double_int(1, $52);
   $tmp722=$53;
   var $54=$1;
   var $55=$tmp721;
   var $56=$tmp722;
   _atscntrb_html5_canvas2d_moveTo($54, $55, $56);
   var $57=$tmp688;
   var $58=$tmp689;
   var $59=_atspre_g0int_add_int($57, $58);
   $tmp726=$59;
   var $60=$tmp726;
   var $61=_atspre_mul_double_int(1, $60);
   $tmp725=$61;
   var $62=$tmp697;
   var $63=_atspre_g0int_sub_int(165, $62);
   $tmp728=$63;
   var $64=$tmp728;
   var $65=_atspre_mul_double_int(1, $64);
   $tmp727=$65;
   var $66=$1;
   var $67=$tmp725;
   var $68=$tmp727;
   _atscntrb_html5_canvas2d_lineTo($66, $67, $68);
   var $69=$1;
   _atscntrb_html5_canvas2d_set_lineWidth_double($69, 0.25);
   var $70=$1;
   _atscntrb_html5_canvas2d_set_strokeStyle_string($70, ((1040)|0));
   var $71=$1;
   _atscntrb_html5_canvas2d_stroke($71);
   var $72=$1;
   _atscntrb_html5_canvas2d_closePath($72);
   var $73=$1;
   _atscntrb_html5_canvas2d_restore($73);
   label = 5; break;
  case 4: 
   label = 5; break;
  case 5: 
   var $76=$1;
   _atscntrb_html5_canvas2d_set_fillStyle_string($76, ((760)|0));
   var $77=$tmp688;
   var $78=_atspre_mul_double_int(1, $77);
   $tmp735=$78;
   var $79=$tmp689;
   var $80=_atspre_mul_double_int(1, $79);
   $tmp736=$80;
   var $81=_atspre_mul_double_int(1, 165);
   $tmp737=$81;
   var $82=$1;
   var $83=$tmp735;
   var $84=$tmp736;
   var $85=$tmp737;
   _atscntrb_html5_canvas2d_fillRect($82, $83, 0, $84, $85);
   var $86=$1;
   _atscntrb_html5_canvas2d_restore($86);
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_size__247__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret614__2;
   var $tmp615__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__20($3);
   $tmp615__2=$4;
   var $5=$tmp615__2;
   var $6=_ATSLIB_056_prelude__arrszref_get_size__250__2($5);
   $tmpret614__2=$6;
   var $7=$tmpret614__2;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_size__247__3($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret614__3;
   var $tmp615__3;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__21($3);
   $tmp615__3=$4;
   var $5=$tmp615__3;
   var $6=_ATSLIB_056_prelude__arrszref_get_size__250__3($5);
   $tmpret614__3=$6;
   var $7=$tmpret614__3;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0int2float_int_double($x) {
 var label = 0;
 var $1;
 $1=$x;
 var $2=$1;
 var $3=(($2)|(0));
 return $3;
}
function _atspre_g0float_div_double($f1, $f2) {
 var label = 0;
 var $1;
 var $2;
 $1=$f1;
 $2=$f2;
 var $3=$1;
 var $4=$2;
 var $5=($3)/($4);
 return $5;
}
function _loop_261($env0, $env1, $env2, $arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $5;
   var $argx0;
   var $argx1;
   var $tmp645;
   var $tmp646;
   var $tmp667;
   var $tmp668;
   var $tmp669;
   var $tmp670;
   var $tmp675;
   var $tmp676;
   var $tmp679;
   var $tmp682;
   var $tmp683;
   var $tmp684;
   var $tmp685;
   $1=$env0;
   $2=$env1;
   $3=$env2;
   $4=$arg0;
   $5=$arg1;
   label = 2; break;
  case 2: 
   var $7=$5;
   var $8=$3;
   var $9=_atspre_g0uint_lt_size($7, $8);
   $tmp645=$9;
   var $10=$tmp645;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 14; break; }
  case 3: 
   var $13=$1;
   var $14=$5;
   var $15=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__9($13, $14);
   $tmp646=$15;
   var $16=$5;
   $tmp667=$16;
   var $17=$tmp646;
   var $18=_atspre_g0int_sub_int(165, $17);
   $tmp668=$18;
   label = 4; break;
  case 4: 
   label = 5; break;
  case 5: 
   var $21=_atspre_g0int_neg_int(1);
   $tmp675=$21;
   var $22=$2;
   var $23=$tmp675;
   var $24=_ATSLIB_056_prelude__eq_g0int_int__272__1($22, $23);
   $tmp670=$24;
   var $25=$tmp670;
   var $26=(($25)|(0))==1;
   if ($26) { label = 7; break; } else { label = 6; break; }
  case 6: 
   label = 8; break;
  case 7: 
   $tmp669=((520)|0);
   label = 12; break;
  case 8: 
   var $30=$5;
   $tmp679=$30;
   var $31=$2;
   var $32=$tmp679;
   var $33=_ATSLIB_056_prelude__eq_g0int_int__272__2($31, $32);
   $tmp676=$33;
   var $34=$tmp676;
   var $35=(($34)|(0))!=0;
   if ($35) { label = 9; break; } else { label = 10; break; }
  case 9: 
   $tmp669=((504)|0);
   label = 11; break;
  case 10: 
   $tmp669=((520)|0);
   label = 11; break;
  case 11: 
   label = 12; break;
  case 12: 
   var $40=$4;
   var $41=$tmp669;
   _atscntrb_html5_canvas2d_set_fillStyle_string($40, $41);
   var $42=$tmp667;
   var $43=_atspre_mul_double_int(1, $42);
   $tmp682=$43;
   var $44=$tmp668;
   var $45=_atspre_mul_double_int(1, $44);
   $tmp683=$45;
   var $46=$tmp646;
   var $47=_atspre_mul_double_int(1, $46);
   $tmp684=$47;
   var $48=$4;
   var $49=$tmp682;
   var $50=$tmp683;
   var $51=$tmp684;
   _atscntrb_html5_canvas2d_fillRect($48, $49, $50, 1, $51);
   var $52=$5;
   var $53=_atspre_g0uint_succ_size($52);
   $tmp685=$53;
   label = 13; break;
  case 13: 
   var $55=$4;
   $argx0=$55;
   var $56=$tmp685;
   $argx1=$56;
   var $57=$argx0;
   $4=$57;
   var $58=$argx1;
   $5=$58;
   label = 2; break;
  case 14: 
   label = 15; break;
  case 15: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0int_neg_int($x) {
 var label = 0;
 var $1;
 $1=$x;
 var $2=$1;
 var $3=(((-$2))|0);
 return $3;
}
function _ATSLIB_056_prelude__gt_g0int_int__277__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret692__1;
   var $tmp693__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp693__1=$4;
   var $5=$1;
   var $6=$tmp693__1;
   var $7=_atspre_g0int_gt_int($5, $6);
   $tmpret692__1=$7;
   var $8=$tmpret692__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__10($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__10;
   var $tmp155__10;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__10=$4;
   var $5=$1;
   var $6=$tmp155__10;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__10($5, $6);
   $tmpret154__10=$7;
   var $8=$tmpret154__10;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_mul_double_int($f1, $i2) {
 var label = 0;
 var $1;
 var $2;
 $1=$f1;
 $2=$i2;
 var $3=$1;
 var $4=$2;
 var $5=(($4)|(0));
 var $6=($3)*($5);
 return $6;
}
function _atspre_g0int_sub_int($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=((($3)-($4))|0);
 return $5;
}
function _atspre_g0int_add_int($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=((($3)+($4))|0);
 return $5;
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__start_animation() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   label = 2; break;
  case 2: 
   _JS_window_requestAnimationFrame((2));
   return;
  default: assert(0, "bad label: " + label);
 }
}
function ___patsfun_291($arg0) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmp741;
   var $tmp742;
   var $tmp743;
   var $tmp745;
   var $tmp747;
   var $tmp748;
   var $tmp749;
   var $tmp751;
   var $tmp752;
   var $tmp756;
   var $tmp757;
   var $tmp758=sp;
   var $tmp759;
   var $tmp760;
   var $tmp761=(sp)+(8);
   var $tmp762;
   var $tmp764=(sp)+(16);
   var $tmp765;
   var $tmp766;
   var $tmp768;
   var $tmp770;
   var $tmp772;
   var $tmp773;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=__057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__theNextRender_get();
   $tmp742=$3;
   var $4=$tmp742;
   var $5=$1;
   var $6=_atspre_g0float_lt_double($4, $5);
   $tmp741=$6;
   var $7=$tmp741;
   var $8=(($7)|(0))!=0;
   if ($8) { label = 3; break; } else { label = 18; break; }
  case 3: 
   var $10=__057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_pop();
   $tmp743=$10;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__theNextRender_incby(100);
   var $11=_atscntrb_html5_canvas2d_make(((688)|0));
   $tmp745=$11;
   var $12=$tmp745;
   var $13=_atspre_gt_ptr_intz($12, 0);
   $tmp747=$13;
   var $14=$tmp747;
   _atspre_assert_errmsg_bool($14, ((552)|0));
   var $15=_atscntrb_html_document_get_documentElement_clientWidth();
   $tmp748=$15;
   var $16=_atscntrb_html_document_get_documentElement_clientHeight();
   $tmp749=$16;
   var $17=$tmp748;
   var $18=$tmp749;
   _JS_canvas2d_set_size_int(((688)|0), $17, $18);
   var $19=$tmp748;
   var $20=_atspre_g0int2float_int_double($19);
   $tmp751=$20;
   var $21=$tmp749;
   var $22=_atspre_g0int2float_int_double($21);
   $tmp752=$22;
   var $23=$tmp745;
   var $24=$tmp751;
   var $25=$tmp752;
   _atscntrb_html5_canvas2d_clearRect($23, 0, 0, $24, $25);
   var $26=$tmp745;
   _atscntrb_html5_canvas2d_set_fillStyle_string($26, ((544)|0));
   var $27=$tmp745;
   var $28=$tmp751;
   var $29=$tmp752;
   _atscntrb_html5_canvas2d_fillRect($27, 0, 0, $28, $29);
   label = 4; break;
  case 4: 
   label = 5; break;
  case 5: 
   var $32=$tmp743;
   var $33=(($32)>>>(0)) >= 1024;
   if ($33) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $35=$tmp743;
   var $36=$35;
   var $37=(($36)|0);
   var $38=HEAP32[(($37)>>2)];
   var $39=(($38)|(0))==0;
   if ($39) { label = 8; break; } else { label = 7; break; }
  case 7: 
   label = 10; break;
  case 8: 
   label = 9; break;
  case 9: 
   var $43=$tmp743;
   var $44=$43;
   var $45=(($44+4)|0);
   var $46=HEAP32[(($45)>>2)];
   $tmp756=$46;
   $tmp765=0;
   $tmp766=0;
   var $47=$tmp765;
   var $48=(($tmp764)|0);
   HEAP32[(($48)>>2)]=$47;
   var $49=$tmp766;
   var $50=(($tmp764+4)|0);
   HEAP32[(($50)>>2)]=$49;
   var $51=_atspre_g0int_neg_int(1);
   $tmp768=$51;
   var $52=$tmp745;
   var $53=$tmp756;
   var $54=$tmp748;
   var $55=$tmp749;
   var $56=$tmp768;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__draw_array0($52, $53, $54, $55, $tmp764, $56);
   var $57=$tmp745;
   _atscntrb_html5_canvas2d_free($57);
   label = 17; break;
  case 10: 
   var $59=$tmp743;
   var $60=(($59)>>>(0)) >= 1024;
   if ($60) { label = 11; break; } else { label = 12; break; }
  case 11: 
   var $62=$tmp743;
   var $63=$62;
   var $64=(($63)|0);
   var $65=HEAP32[(($64)>>2)];
   var $66=(($65)|(0))==1;
   if ($66) { label = 13; break; } else { label = 12; break; }
  case 12: 
   label = 15; break;
  case 13: 
   label = 14; break;
  case 14: 
   var $70=$tmp743;
   var $71=$70;
   var $72=(($71+4)|0);
   var $73=HEAP32[(($72)>>2)];
   $tmp757=$73;
   var $74=$tmp743;
   var $75=$74;
   var $76=(($75+8)|0);
   var $77=$tmp758;
   var $78=$76;
   assert(8 % 1 === 0);HEAP32[(($77)>>2)]=HEAP32[(($78)>>2)];HEAP32[((($77)+(4))>>2)]=HEAP32[((($78)+(4))>>2)];
   var $79=$tmp743;
   var $80=$79;
   var $81=(($80+16)|0);
   var $82=HEAP32[(($81)>>2)];
   $tmp759=$82;
   var $83=$tmp759;
   $tmp770=$83;
   var $84=$tmp745;
   var $85=$tmp757;
   var $86=$tmp748;
   var $87=$tmp749;
   var $88=$tmp770;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__draw_array0($84, $85, $86, $87, $tmp758, $88);
   var $89=$tmp745;
   _atscntrb_html5_canvas2d_free($89);
   label = 17; break;
  case 15: 
   label = 16; break;
  case 16: 
   var $92=$tmp743;
   var $93=$92;
   var $94=(($93+4)|0);
   var $95=HEAP32[(($94)>>2)];
   $tmp760=$95;
   var $96=$tmp743;
   var $97=$96;
   var $98=(($97+8)|0);
   var $99=$tmp761;
   var $100=$98;
   assert(8 % 1 === 0);HEAP32[(($99)>>2)]=HEAP32[(($100)>>2)];HEAP32[((($99)+(4))>>2)]=HEAP32[((($100)+(4))>>2)];
   var $101=$tmp743;
   var $102=$101;
   var $103=(($102+16)|0);
   var $104=HEAP32[(($103)>>2)];
   $tmp762=$104;
   var $105=$tmp762;
   $tmp772=$105;
   var $106=$tmp745;
   var $107=$tmp760;
   var $108=$tmp748;
   var $109=$tmp749;
   var $110=$tmp772;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__draw_array0($106, $107, $108, $109, $tmp761, $110);
   var $111=$tmp745;
   _atscntrb_html5_canvas2d_free($111);
   label = 17; break;
  case 17: 
   label = 19; break;
  case 18: 
   label = 19; break;
  case 19: 
   var $115=__057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_hasmore();
   $tmp773=$115;
   var $116=$tmp773;
   var $117=(($116)|(0))!=0;
   if ($117) { label = 20; break; } else { label = 21; break; }
  case 20: 
   _JS_window_requestAnimationFrame((2));
   label = 22; break;
  case 21: 
   label = 22; break;
  case 22: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _mainats_void_0() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmp776;
   var $tmp779;
   var $tmp815;
   var $tmp819;
   var $tmp863;
   var $tmp870;
   var $tmp892;
   var $tmp894;
   var $tmp916;
   label = 2; break;
  case 2: 
   var $2=_ATSLIB_056_prelude__gt_g1int_int__51__2(150, 0);
   $tmp776=$2;
   var $3=$tmp776;
   _atspre_assert_errmsg_bool($3, ((168)|0));
   var $4=_atspre_g0int_add_int(150, 1);
   $tmp815=$4;
   var $5=$tmp815;
   var $6=_ATSLIB_056_prelude__arrayptr_make_intrange__295__1(1, $5);
   $tmp779=$6;
   $tmp819=150;
   var $7=$tmp779;
   var $8=$tmp819;
   _ATSLIB_056_prelude__array_permute__312__1($7, $8);
   var $9=$tmp779;
   var $10=$tmp819;
   var $11=_ATSLIB_056_libats_056_ML__array0_make_arrayref__329__1($9, $10);
   $tmp863=$11;
   var $12=$tmp863;
   var $13=_ATSLIB_056_libats_056_ML__array0_copy__78__5($12);
   $tmp870=$13;
   var $14=_atsruntime_malloc_libc_exn(8);
   $tmp892=$14;
   var $15=$tmp892;
   var $16=$15;
   var $17=(($16)|0);
   HEAP32[(($17)>>2)]=0;
   var $18=$tmp870;
   var $19=$tmp892;
   var $20=$19;
   var $21=(($20+4)|0);
   HEAP32[(($21)>>2)]=$18;
   var $22=$tmp892;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_push($22);
   var $23=$tmp863;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__intqsort($23);
   var $24=$tmp863;
   var $25=_ATSLIB_056_libats_056_ML__array0_copy__78__6($24);
   $tmp894=$25;
   var $26=_atsruntime_malloc_libc_exn(8);
   $tmp916=$26;
   var $27=$tmp916;
   var $28=$27;
   var $29=(($28)|0);
   HEAP32[(($29)>>2)]=0;
   var $30=$tmp894;
   var $31=$tmp916;
   var $32=$31;
   var $33=(($32+4)|0);
   HEAP32[(($33)>>2)]=$30;
   var $34=$tmp916;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_push($34);
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_reverse();
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__start_animation();
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__gt_g1int_int__51__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret147__2;
   var $tmp148__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp148__2=$4;
   var $5=$1;
   var $6=$tmp148__2;
   var $7=_atspre_g0int_gt_int($5, $6);
   $tmpret147__2=$7;
   var $8=$tmpret147__2;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_assert_errmsg_bool($b, $msg) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$b;
   $2=$msg;
   var $3=$1;
   var $4=(($3)|(0))!=0;
   if ($4) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $6=HEAP32[((_stderr)>>2)];
   var $7=$2;
   var $8=_fprintf($6, ((704)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$7,tempVarArgs)); STACKTOP=tempVarArgs;
   _exit(1);
   throw "Reached an unreachable!";
  case 3: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayptr_make_intrange__295__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret780__1;
   var $tmp781__1;
   var $tmp782__1;
   var $tmp783__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=$1;
   var $6=_atspre_g0int_sub_int($4, $5);
   $tmp782__1=$6;
   var $7=$tmp782__1;
   $tmp781__1=$7;
   var $8=$tmp781__1;
   var $9=_ATSLIB_056_prelude__arrayptr_make_uninitized__300__1($8);
   $tmp783__1=$9;
   var $10=$tmp783__1;
   var $11=$tmp781__1;
   var $12=$1;
   _loop_296__296__1($10, $11, $12);
   var $13=$tmp783__1;
   $tmpret780__1=$13;
   var $14=$tmpret780__1;
   return $14;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_permute__312__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   _loop_313__313__1($4, $5);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_make_arrayref__329__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret864__1;
   var $tmp865__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__arrszref_make_arrayref__87__5($4, $5);
   $tmp865__1=$6;
   var $7=$tmp865__1;
   var $8=_ATSLIB_056_libats_056_ML__array0_of_arrszref__89__5($7);
   $tmpret864__1=$8;
   var $9=$tmpret864__1;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_copy__78__5($arg0) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret204__5;
   var $tmp205__5;
   var $tmp206__5=sp;
   var $tmp207__5;
   var $tmp208__5;
   var $tmp210__5;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__24($3);
   $tmp205__5=$4;
   var $5=$tmp205__5;
   var $6=$tmp206__5;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__21($5, $6);
   $tmp207__5=$7;
   var $8=HEAP32[(($tmp206__5)>>2)];
   var $9=_ATSLIB_056_prelude__array_ptr_alloc__82__6($8);
   $tmp208__5=$9;
   var $10=$tmp208__5;
   var $11=$tmp207__5;
   var $12=HEAP32[(($tmp206__5)>>2)];
   _ATSLIB_056_prelude__array_copy__85__5($10, $11, $12);
   var $13=$tmp208__5;
   var $14=HEAP32[(($tmp206__5)>>2)];
   var $15=_ATSLIB_056_prelude__arrszref_make_arrayref__87__6($13, $14);
   $tmp210__5=$15;
   var $16=$tmp210__5;
   var $17=_ATSLIB_056_libats_056_ML__array0_of_arrszref__89__6($16);
   $tmpret204__5=$17;
   var $18=$tmpret204__5;
   STACKTOP = sp;
   return $18;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_copy__78__6($arg0) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret204__6;
   var $tmp205__6;
   var $tmp206__6=sp;
   var $tmp207__6;
   var $tmp208__6;
   var $tmp210__6;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__25($3);
   $tmp205__6=$4;
   var $5=$tmp205__6;
   var $6=$tmp206__6;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__22($5, $6);
   $tmp207__6=$7;
   var $8=HEAP32[(($tmp206__6)>>2)];
   var $9=_ATSLIB_056_prelude__array_ptr_alloc__82__7($8);
   $tmp208__6=$9;
   var $10=$tmp208__6;
   var $11=$tmp207__6;
   var $12=HEAP32[(($tmp206__6)>>2)];
   _ATSLIB_056_prelude__array_copy__85__6($10, $11, $12);
   var $13=$tmp208__6;
   var $14=HEAP32[(($tmp206__6)>>2)];
   var $15=_ATSLIB_056_prelude__arrszref_make_arrayref__87__7($13, $14);
   $tmp210__6=$15;
   var $16=$tmp210__6;
   var $17=_ATSLIB_056_libats_056_ML__array0_of_arrszref__89__7($16);
   $tmpret204__6=$17;
   var $18=$tmpret204__6;
   STACKTOP = sp;
   return $18;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__dynload() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $_057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__dynloadflag;
   $_057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__dynloadflag=0;
   var $1=$_057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__dynloadflag;
   var $2=(($1)|(0))==0;
   if ($2) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $_057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__dynloadflag=1;
   _the_atsexncon_initize(1216, ((104)|0));
   HEAP32[((1288)>>2)]=0;
   var $4=HEAP32[((1288)>>2)];
   var $5=_ATSLIB_056_prelude__ref_make_elt__6__1($4);
   HEAP32[((1296)>>2)]=$5;
   var $6=_ATSLIB_056_prelude__ref_make_elt__6__2(1);
   HEAP32[((1280)>>2)]=$6;
   HEAP32[((1264)>>2)]=0;
   var $7=HEAP32[((1264)>>2)];
   var $8=_ATSLIB_056_prelude__ref_make_elt__6__3($7);
   HEAP32[((1272)>>2)]=$8;
   HEAP32[((1240)>>2)]=0;
   HEAP32[((1232)>>2)]=0;
   var $9=HEAP32[((1240)>>2)];
   HEAP32[((((1248)|0))>>2)]=$9;
   var $10=HEAP32[((1232)>>2)];
   HEAP32[((((1252)|0))>>2)]=$10;
   var $11=_ATSLIB_056_prelude__ref_make_elt__6__4(1248);
   HEAP32[((1256)>>2)]=$11;
   var $12=_ATSLIB_056_prelude__ref_make_elt__6__5(0);
   HEAP32[((1224)>>2)]=$12;
   label = 3; break;
  case 3: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _the_atsexncon_initize($d2c, $exnmsg) {
 var label = 0;
 var $1;
 var $2;
 var $exntag;
 $1=$d2c;
 $2=$exnmsg;
 var $3=HEAP32[((8)>>2)];
 $exntag=$3;
 var $4=$exntag;
 var $5=((($4)+(1))|0);
 HEAP32[((8)>>2)]=$5;
 var $6=$exntag;
 var $7=$1;
 var $8=(($7)|0);
 HEAP32[(($8)>>2)]=$6;
 var $9=$2;
 var $10=$1;
 var $11=(($10+4)|0);
 HEAP32[(($11)>>2)]=$9;
 return;
}
function _ATSLIB_056_prelude__ref_make_elt__6__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret38__1;
   var $tmp39__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=_ATSLIB_056_prelude__ptr_alloc__8__1();
   $tmp39__1=$3;
   var $4=$1;
   var $5=$tmp39__1;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   var $7=$tmp39__1;
   $tmpret38__1=$7;
   var $8=$tmpret38__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ref_make_elt__6__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret38__2;
   var $tmp39__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=_ATSLIB_056_prelude__ptr_alloc__8__2();
   $tmp39__2=$3;
   var $4=$1;
   var $5=$tmp39__2;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   var $7=$tmp39__2;
   $tmpret38__2=$7;
   var $8=$tmpret38__2;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ref_make_elt__6__3($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret38__3;
   var $tmp39__3;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=_ATSLIB_056_prelude__ptr_alloc__8__3();
   $tmp39__3=$3;
   var $4=$1;
   var $5=$tmp39__3;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   var $7=$tmp39__3;
   $tmpret38__3=$7;
   var $8=$tmpret38__3;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ref_make_elt__6__4($arg0) {
 var label = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $arg0; $arg0 = STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($arg0)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($arg0)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret38__4;
   var $tmp39__4;
   label = 2; break;
  case 2: 
   var $2=_ATSLIB_056_prelude__ptr_alloc__8__4();
   $tmp39__4=$2;
   var $3=$tmp39__4;
   var $4=$3;
   var $5=$4;
   var $6=$arg0;
   assert(8 % 1 === 0);HEAP32[(($5)>>2)]=HEAP32[(($6)>>2)];HEAP32[((($5)+(4))>>2)]=HEAP32[((($6)+(4))>>2)];
   var $7=$tmp39__4;
   $tmpret38__4=$7;
   var $8=$tmpret38__4;
   STACKTOP = sp;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ref_make_elt__6__5($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret38__5;
   var $tmp39__5;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=_ATSLIB_056_prelude__ptr_alloc__8__5();
   $tmp39__5=$3;
   var $4=$1;
   var $5=$tmp39__5;
   var $6=$5;
   HEAPF64[(($6)>>3)]=$4;
   var $7=$tmp39__5;
   $tmpret38__5=$7;
   var $8=$tmpret38__5;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _atsruntime_handle_uncaughtexn_rest($exn0) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1;
 $1=$exn0;
 var $2=HEAP32[((_stderr)>>2)];
 var $3=$1;
 var $4=(($3+4)|0);
 var $5=HEAP32[(($4)>>2)];
 var $6=$1;
 var $7=(($6)|0);
 var $8=HEAP32[(($7)>>2)];
 var $9=_fprintf($2, ((912)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$5,HEAP32[(((tempVarArgs)+(8))>>2)]=$8,tempVarArgs)); STACKTOP=tempVarArgs;
 _exit(1);
 throw "Reached an unreachable!";
 STACKTOP = sp;
 return;
}
function _atsruntime_malloc_libc($bsz) {
 var label = 0;
 var $1;
 $1=$bsz;
 var $2=$1;
 var $3=_malloc($2);
 return $3;
}
function _atsruntime_handle_uncaughtexn($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmp1;
   var $tmp2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   label = 3; break;
  case 3: 
   label = 4; break;
  case 4: 
   var $5=$1;
   var $6=(($5)|(0))==1208;
   if ($6) { label = 6; break; } else { label = 5; break; }
  case 5: 
   label = 8; break;
  case 6: 
   label = 7; break;
  case 7: 
   var $10=HEAP32[((_stderr)>>2)];
   var $11=$10;
   _atspre_fprint_string($11, ((864)|0));
   var $12=HEAP32[((_stderr)>>2)];
   var $13=$12;
   _atspre_fprint_string($13, ((848)|0));
   var $14=HEAP32[((_stderr)>>2)];
   var $15=$14;
   _atspre_fprint_newline($15);
   _atspre_exit(1);
   label = 21; break;
  case 8: 
   var $17=$1;
   var $18=(($17)|(0))==1184;
   if ($18) { label = 10; break; } else { label = 9; break; }
  case 9: 
   label = 12; break;
  case 10: 
   label = 11; break;
  case 11: 
   var $22=HEAP32[((_stderr)>>2)];
   var $23=$22;
   _atspre_fprint_string($23, ((864)|0));
   var $24=HEAP32[((_stderr)>>2)];
   var $25=$24;
   _atspre_fprint_string($25, ((832)|0));
   var $26=HEAP32[((_stderr)>>2)];
   var $27=$26;
   _atspre_fprint_newline($27);
   _atspre_exit(1);
   label = 21; break;
  case 12: 
   var $29=$1;
   var $30=$29;
   var $31=(($30)|0);
   var $32=HEAP32[(($31)>>2)];
   var $33=HEAP32[((((1200)|0))>>2)];
   var $34=(($32)|(0))==(($33)|(0));
   if ($34) { label = 14; break; } else { label = 13; break; }
  case 13: 
   label = 16; break;
  case 14: 
   label = 15; break;
  case 15: 
   var $38=$1;
   var $39=$38;
   var $40=(($39+8)|0);
   var $41=HEAP32[(($40)>>2)];
   $tmp1=$41;
   var $42=HEAP32[((_stderr)>>2)];
   var $43=$42;
   _atspre_fprint_string($43, ((864)|0));
   var $44=HEAP32[((_stderr)>>2)];
   var $45=$44;
   _atspre_fprint_string($45, ((808)|0));
   var $46=HEAP32[((_stderr)>>2)];
   var $47=$46;
   var $48=$tmp1;
   _atspre_fprint_string($47, $48);
   var $49=HEAP32[((_stderr)>>2)];
   var $50=$49;
   _atspre_fprint_newline($50);
   _atspre_exit(1);
   label = 21; break;
  case 16: 
   var $52=$1;
   var $53=$52;
   var $54=(($53)|0);
   var $55=HEAP32[(($54)>>2)];
   var $56=HEAP32[((((1192)|0))>>2)];
   var $57=(($55)|(0))==(($56)|(0));
   if ($57) { label = 18; break; } else { label = 17; break; }
  case 17: 
   label = 20; break;
  case 18: 
   label = 19; break;
  case 19: 
   var $61=$1;
   var $62=$61;
   var $63=(($62+8)|0);
   var $64=HEAP32[(($63)>>2)];
   $tmp2=$64;
   var $65=HEAP32[((_stderr)>>2)];
   var $66=$65;
   _atspre_fprint_string($66, ((864)|0));
   var $67=HEAP32[((_stderr)>>2)];
   var $68=$67;
   _atspre_fprint_string($68, ((784)|0));
   var $69=HEAP32[((_stderr)>>2)];
   var $70=$69;
   var $71=$tmp2;
   _atspre_fprint_string($70, $71);
   var $72=HEAP32[((_stderr)>>2)];
   var $73=$72;
   _atspre_fprint_newline($73);
   _atspre_exit(1);
   label = 21; break;
  case 20: 
   var $75=$1;
   var $76=$75;
   _atsruntime_handle_uncaughtexn_rest($76);
   label = 21; break;
  case 21: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_fprint_string($out, $x) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1;
 var $2;
 var $err;
 $1=$out;
 $2=$x;
 $err=0;
 var $3=$1;
 var $4=$3;
 var $5=$2;
 var $6=_fprintf($4, ((704)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$5,tempVarArgs)); STACKTOP=tempVarArgs;
 var $7=$err;
 var $8=((($7)+($6))|0);
 $err=$8;
 STACKTOP = sp;
 return;
}
function _atspre_fprint_newline($out) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $n;
   var $err;
   $1=$out;
   $err=-1;
   var $2=$1;
   var $3=$2;
   var $4=_fprintf($3, ((752)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $n=$4;
   var $5=$n;
   var $6=(($5)|(0)) > 0;
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $8=$1;
   var $9=$8;
   var $10=_fflush($9);
   $err=$10;
   label = 3; break;
  case 3: 
   var $12=$err;
   var $13=(($12)|(0)) < 0;
   if ($13) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $15=HEAP32[((_stderr)>>2)];
   var $16=_fprintf($15, ((712)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   _exit(1);
   throw "Reached an unreachable!";
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_exit($ecode) {
 var label = 0;
 var $1;
 $1=$ecode;
 var $2=$1;
 _exit($2);
 throw "Reached an unreachable!";
 return;
}
function _my_atsexnframe_getref() {
 var label = 0;
 return 1304;
}
function _atsruntime_raise($exn0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $frame;
   $1=$exn0;
   var $2=_my_atsexnframe_getref();
   var $3=HEAP32[(($2)>>2)];
   $frame=$3;
   label = 2; break;
  case 2: 
   var $5=$frame;
   var $6=(($5)|(0))!=0;
   if ($6) { label = 4; break; } else { label = 3; break; }
  case 3: 
   label = 5; break;
  case 4: 
   var $9=$1;
   var $10=$9;
   var $11=$frame;
   var $12=(($11+156)|0);
   HEAP32[(($12)>>2)]=$10;
   var $13=$frame;
   var $14=(($13)|0);
   var $15=(($14)|0);
   _longjmp($15, 1);
   throw "Reached an unreachable!";
  case 5: 
   var $17=$1;
   _atsruntime_handle_uncaughtexn($17);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _main($argc, $argv, $envp) {
 var label = 0;
 var $1;
 var $2;
 var $3;
 var $4;
 var $err;
 $1=0;
 $2=$argc;
 $3=$argv;
 $4=$envp;
 $err=0;
 __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__dynload();
 _mainats_void_0();
 var $5=$err;
 return $5;
}
Module["_main"] = _main;
function _ATSLIB_056_prelude__ptr_alloc__8__5() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret42__5;
   label = 2; break;
  case 2: 
   var $2=_atsruntime_malloc_libc_exn(8);
   $tmpret42__5=$2;
   var $3=$tmpret42__5;
   return $3;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr_alloc__8__4() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret42__4;
   label = 2; break;
  case 2: 
   var $2=_atsruntime_malloc_libc_exn(8);
   $tmpret42__4=$2;
   var $3=$tmpret42__4;
   return $3;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr_alloc__8__3() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret42__3;
   label = 2; break;
  case 2: 
   var $2=_atsruntime_malloc_libc_exn(4);
   $tmpret42__3=$2;
   var $3=$tmpret42__3;
   return $3;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr_alloc__8__2() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret42__2;
   label = 2; break;
  case 2: 
   var $2=_atsruntime_malloc_libc_exn(4);
   $tmpret42__2=$2;
   var $3=$tmpret42__2;
   return $3;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr_alloc__8__1() {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $tmpret42__1;
   label = 2; break;
  case 2: 
   var $2=_atsruntime_malloc_libc_exn(4);
   $tmpret42__1=$2;
   var $3=$tmpret42__1;
   return $3;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__25($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__25;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__25=$3;
   var $4=$tmpret162__25;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__22($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__22;
   var $tmp175__22;
   var $tmp176__22;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__22=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__22=$11;
   var $12=$tmp176__22;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__22;
   $tmpret174__22=$15;
   var $16=$tmpret174__22;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
// WARNING: content after a branch in a label, line: 2113
// WARNING: content after a branch in a label, line: 2396
function _ATSLIB_056_prelude__array_ptr_alloc__82__7($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret222__7;
   var $tmp223__7;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_g0uint_mul_size($3, 4);
   $tmp223__7=$4;
   var $5=$tmp223__7;
   var $6=_atsruntime_malloc_libc_exn($5);
   $tmpret222__7=$6;
   var $7=$tmpret222__7;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_copy__85__6($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp227__6;
   var $tmp228__6;
   var $tmp229__6;
   var $tmp230__6;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   $tmp227__6=$5;
   var $6=$2;
   $tmp228__6=$6;
   var $7=$3;
   var $8=_atspre_g0uint_mul_size($7, 4);
   $tmp230__6=$8;
   var $9=$tmp227__6;
   var $10=$tmp228__6;
   var $11=$tmp230__6;
   assert($11 % 1 === 0);(_memcpy($9, $10, $11)|0);
   $tmp229__6=$9;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_make_arrayref__87__7($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret236__7;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=_atsruntime_malloc_libc_exn(8);
   $tmpret236__7=$4;
   var $5=$1;
   var $6=$tmpret236__7;
   var $7=$6;
   var $8=(($7)|0);
   HEAP32[(($8)>>2)]=$5;
   var $9=$2;
   var $10=$tmpret236__7;
   var $11=$10;
   var $12=(($11+4)|0);
   HEAP32[(($12)>>2)]=$9;
   var $13=$tmpret236__7;
   return $13;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_of_arrszref__89__7($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret238__7;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret238__7=$3;
   var $4=$tmpret238__7;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0uint_mul_size($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=(Math.imul($3,$4)|0);
 return $5;
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__24($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__24;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__24=$3;
   var $4=$tmpret162__24;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__21($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__21;
   var $tmp175__21;
   var $tmp176__21;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__21=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__21=$11;
   var $12=$tmp176__21;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__21;
   $tmpret174__21=$15;
   var $16=$tmpret174__21;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_ptr_alloc__82__6($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret222__6;
   var $tmp223__6;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_g0uint_mul_size($3, 4);
   $tmp223__6=$4;
   var $5=$tmp223__6;
   var $6=_atsruntime_malloc_libc_exn($5);
   $tmpret222__6=$6;
   var $7=$tmpret222__6;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_copy__85__5($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp227__5;
   var $tmp228__5;
   var $tmp229__5;
   var $tmp230__5;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   $tmp227__5=$5;
   var $6=$2;
   $tmp228__5=$6;
   var $7=$3;
   var $8=_atspre_g0uint_mul_size($7, 4);
   $tmp230__5=$8;
   var $9=$tmp227__5;
   var $10=$tmp228__5;
   var $11=$tmp230__5;
   assert($11 % 1 === 0);(_memcpy($9, $10, $11)|0);
   $tmp229__5=$9;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_make_arrayref__87__6($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret236__6;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=_atsruntime_malloc_libc_exn(8);
   $tmpret236__6=$4;
   var $5=$1;
   var $6=$tmpret236__6;
   var $7=$6;
   var $8=(($7)|0);
   HEAP32[(($8)>>2)]=$5;
   var $9=$2;
   var $10=$tmpret236__6;
   var $11=$10;
   var $12=(($11+4)|0);
   HEAP32[(($12)>>2)]=$9;
   var $13=$tmpret236__6;
   return $13;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_of_arrszref__89__6($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret238__6;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret238__6=$3;
   var $4=$tmpret238__6;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_make_arrayref__87__5($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret236__5;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=_atsruntime_malloc_libc_exn(8);
   $tmpret236__5=$4;
   var $5=$1;
   var $6=$tmpret236__5;
   var $7=$6;
   var $8=(($7)|0);
   HEAP32[(($8)>>2)]=$5;
   var $9=$2;
   var $10=$tmpret236__5;
   var $11=$10;
   var $12=(($11+4)|0);
   HEAP32[(($12)>>2)]=$9;
   var $13=$tmpret236__5;
   return $13;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_of_arrszref__89__5($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret238__5;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret238__5=$3;
   var $4=$tmpret238__5;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _loop_313__313__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $argx0;
   var $argx1;
   var $tmp823__1;
   var $tmp824__1;
   var $tmp826__1;
   var $tmp827__1;
   var $tmp828__1;
   var $tmp829__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=_ATSLIB_056_prelude__gte_g1uint_int__316__1($4, 2);
   $tmp823__1=$5;
   var $6=$tmp823__1;
   var $7=(($6)|(0))!=0;
   if ($7) { label = 3; break; } else { label = 8; break; }
  case 3: 
   var $9=$2;
   var $10=_ATSLIB_056_prelude__array_permute__randint__311__1($9);
   $tmp824__1=$10;
   var $11=$tmp824__1;
   var $12=_ATSLIB_056_prelude__gt_g1uint_int__304__2($11, 0);
   $tmp826__1=$12;
   var $13=$tmp826__1;
   var $14=(($13)|(0))!=0;
   if ($14) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $16=$1;
   var $17=$tmp824__1;
   var $18=_ATSLIB_056_prelude__ptr0_add_guint__72__17($16, $17);
   $tmp827__1=$18;
   var $19=$tmp827__1;
   var $20=$1;
   _ATSLIB_056_prelude_056_unsafe__ptr0_exch__324__1($19, $20);
   label = 6; break;
  case 5: 
   label = 6; break;
  case 6: 
   var $23=$1;
   var $24=_ATSLIB_056_prelude__ptr1_succ__326__1($23);
   $tmp828__1=$24;
   var $25=$2;
   var $26=_atspre_g0uint_pred_size($25);
   $tmp829__1=$26;
   label = 7; break;
  case 7: 
   var $28=$tmp828__1;
   $argx0=$28;
   var $29=$tmp829__1;
   $argx1=$29;
   var $30=$argx0;
   $1=$30;
   var $31=$argx1;
   $2=$31;
   label = 2; break;
  case 8: 
   label = 9; break;
  case 9: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__gte_g1uint_int__316__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret839__1;
   var $tmp840__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp840__1=$4;
   var $5=$1;
   var $6=$tmp840__1;
   var $7=_atspre_g0uint_gte_size($5, $6);
   $tmpret839__1=$7;
   var $8=$tmpret839__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_permute__randint__311__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret816__1;
   var $tmp817__1;
   var $tmp818__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmp818__1=$3;
   var $4=$tmp818__1;
   var $5=_ATSCNTRB_056_atshwxi_056_testing__randint__2__2($4);
   $tmp817__1=$5;
   var $6=$tmp817__1;
   $tmpret816__1=$6;
   var $7=$tmpret816__1;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__gt_g1uint_int__304__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret808__2;
   var $tmp809__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp809__2=$4;
   var $5=$1;
   var $6=$tmp809__2;
   var $7=_atspre_g0uint_gt_size($5, $6);
   $tmpret808__2=$7;
   var $8=$tmpret808__2;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__17($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__17;
   var $tmp187__17;
   var $tmp188__17;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__17=$4;
   var $5=$tmp188__17;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__17=$6;
   var $7=$1;
   var $8=$tmp187__17;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__17=$9;
   var $10=$tmpret186__17;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_exch__324__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmp855__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=HEAP32[(($5)>>2)];
   $tmp855__1=$6;
   var $7=$2;
   var $8=$7;
   var $9=HEAP32[(($8)>>2)];
   var $10=$1;
   var $11=$10;
   HEAP32[(($11)>>2)]=$9;
   var $12=$tmp855__1;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr1_succ__326__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret858__1;
   var $tmp859__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_prelude__ptr0_succ__307__2($3);
   $tmp859__1=$4;
   var $5=$tmp859__1;
   $tmpret858__1=$5;
   var $6=$tmpret858__1;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0uint_pred_size($x) {
 var label = 0;
 var $1;
 $1=$x;
 var $2=$1;
 var $3=((($2)-(1))|0);
 return $3;
}
function _ATSLIB_056_prelude__ptr0_succ__307__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret813__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_add_ptr_bsz($3, 4);
   $tmpret813__2=$4;
   var $5=$tmpret813__2;
   return $5;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_add_ptr_bsz($p, $ofs) {
 var label = 0;
 var $1;
 var $2;
 $1=$p;
 $2=$ofs;
 var $3=$1;
 var $4=$2;
 var $5=(($3+$4)|0);
 return $5;
}
function _atspre_g0uint_gt_size($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=(($3)>>>(0)) > (($4)>>>(0));
 var $6=$5 ? 1 : 0;
 return $6;
}
function _ATSCNTRB_056_atshwxi_056_testing__randint__2__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret9__2;
   var $tmp10__2;
   var $tmp11__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=_JS_Math_random();
   $tmp11__2=$3;
   var $4=$1;
   var $5=$tmp11__2;
   var $6=_atspre_mul_int_double($4, $5);
   $tmp10__2=$6;
   var $7=$tmp10__2;
   var $8=(($7)&-1);
   $tmpret9__2=$8;
   var $9=$tmpret9__2;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_mul_int_double($i1, $f2) {
 var label = 0;
 var $1;
 var $2;
 $1=$i1;
 $2=$f2;
 var $3=$1;
 var $4=(($3)|(0));
 var $5=$2;
 var $6=($4)*($5);
 return $6;
}
function _atspre_g0uint_gte_size($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=(($3)>>>(0)) >= (($4)>>>(0));
 var $6=$5 ? 1 : 0;
 return $6;
}
function _ATSLIB_056_prelude__arrayptr_make_uninitized__300__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret796__1;
   var $tmp797__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_prelude__array_ptr_alloc__82__5($3);
   $tmp797__1=$4;
   var $5=$tmp797__1;
   $tmpret796__1=$5;
   var $6=$tmpret796__1;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _loop_296__296__1($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $argx0;
   var $argx1;
   var $argx2;
   var $tmp785__1;
   var $tmp787__1;
   var $tmp788__1;
   var $tmp789__1;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$2;
   var $6=_ATSLIB_056_prelude__gt_g1uint_int__304__1($5, 0);
   $tmp785__1=$6;
   var $7=$tmp785__1;
   var $8=(($7)|(0))!=0;
   if ($8) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $10=$1;
   var $11=$3;
   _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__7($10, $11);
   var $12=$1;
   var $13=_ATSLIB_056_prelude__ptr0_succ__307__1($12);
   $tmp787__1=$13;
   var $14=$2;
   var $15=_atspre_g0uint_pred_size($14);
   $tmp788__1=$15;
   var $16=$3;
   var $17=_atspre_g0int_add_int($16, 1);
   $tmp789__1=$17;
   label = 4; break;
  case 4: 
   var $19=$tmp787__1;
   $argx0=$19;
   var $20=$tmp788__1;
   $argx1=$20;
   var $21=$tmp789__1;
   $argx2=$21;
   var $22=$argx0;
   $1=$22;
   var $23=$argx1;
   $2=$23;
   var $24=$argx2;
   $3=$24;
   label = 2; break;
  case 5: 
   label = 6; break;
  case 6: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__gt_g1uint_int__304__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret808__1;
   var $tmp809__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp809__1=$4;
   var $5=$1;
   var $6=$tmp809__1;
   var $7=_atspre_g0uint_gt_size($5, $6);
   $tmpret808__1=$7;
   var $8=$tmpret808__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__7($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=$1;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_succ__307__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret813__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_add_ptr_bsz($3, 4);
   $tmpret813__1=$4;
   var $5=$tmpret813__1;
   return $5;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_ptr_alloc__82__5($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret222__5;
   var $tmp223__5;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_g0uint_mul_size($3, 4);
   $tmp223__5=$4;
   var $5=$tmp223__5;
   var $6=_atsruntime_malloc_libc_exn($5);
   $tmpret222__5=$6;
   var $7=$tmpret222__5;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0int_gt_int($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=(($3)|(0)) > (($4)|(0));
 var $6=$5 ? 1 : 0;
 return $6;
}
function _atspre_g0float_lt_double($f1, $f2) {
 var label = 0;
 var $1;
 var $2;
 $1=$f1;
 $2=$f2;
 var $3=$1;
 var $4=$2;
 var $5=$3 < $4;
 var $6=$5 ? 1 : 0;
 return $6;
}
function _atspre_gt_ptr_intz($p, $_) {
 var label = 0;
 var $1;
 var $2;
 $1=$p;
 $2=$_;
 var $3=$1;
 var $4=(($3)>>>(0)) > 0;
 var $5=$4 ? 1 : 0;
 return $5;
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__10($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__10;
   var $tmp159__10;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__23($4);
   $tmp159__10=$5;
   var $6=$tmp159__10;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__10($6, $7);
   $tmpret158__10=$8;
   var $9=$tmpret158__10;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__23($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__23;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__23=$3;
   var $4=$tmpret162__23;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__10($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__10;
   var $tmp165__10=sp;
   var $tmp166__10;
   var $tmp167__10;
   var $tmp168__10;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__10;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__20($4, $5);
   $tmp166__10=$6;
   var $7=HEAP32[(($tmp165__10)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__10=$9;
   var $10=$tmp167__10;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__10;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__10($13, $14);
   $tmpret164__10=$15;
   label = 5; break;
  case 4: 
   $tmp168__10=1216;
   var $17=$tmp168__10;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__10;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__20($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__20;
   var $tmp175__20;
   var $tmp176__20;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__20=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__20=$11;
   var $12=$tmp176__20;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__20;
   $tmpret174__20=$15;
   var $16=$tmpret174__20;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__10($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__10;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__10($4, $5);
   $tmpret180__10=$6;
   var $7=$tmpret180__10;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__10($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__10;
   var $tmp183__10;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__16($4, $5);
   $tmp183__10=$6;
   var $7=$tmp183__10;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__10($7);
   $tmpret182__10=$8;
   var $9=$tmpret182__10;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__16($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__16;
   var $tmp187__16;
   var $tmp188__16;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__16=$4;
   var $5=$tmp188__16;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__16=$6;
   var $7=$1;
   var $8=$tmp187__16;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__16=$9;
   var $10=$tmpret186__16;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__10($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__10;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__10=$5;
   var $6=$tmpret192__10;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0uint_lt_size($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=(($3)>>>(0)) < (($4)>>>(0));
 var $6=$5 ? 1 : 0;
 return $6;
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__9($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__9;
   var $tmp155__9;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__9=$4;
   var $5=$1;
   var $6=$tmp155__9;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__9($5, $6);
   $tmpret154__9=$7;
   var $8=$tmpret154__9;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__eq_g0int_int__272__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret671__1;
   var $tmp672__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp672__1=$4;
   var $5=$1;
   var $6=$tmp672__1;
   var $7=_atspre_g0int_eq_int($5, $6);
   $tmpret671__1=$7;
   var $8=$tmpret671__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__eq_g0int_int__272__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret671__2;
   var $tmp672__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp672__2=$4;
   var $5=$1;
   var $6=$tmp672__2;
   var $7=_atspre_g0int_eq_int($5, $6);
   $tmpret671__2=$7;
   var $8=$tmpret671__2;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0uint_succ_size($x) {
 var label = 0;
 var $1;
 $1=$x;
 var $2=$1;
 var $3=((($2)+(1))|0);
 return $3;
}
function _atspre_g0int_eq_int($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=(($3)|(0))==(($4)|(0));
 var $6=$5 ? 1 : 0;
 return $6;
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__9($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__9;
   var $tmp159__9;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__22($4);
   $tmp159__9=$5;
   var $6=$tmp159__9;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__9($6, $7);
   $tmpret158__9=$8;
   var $9=$tmpret158__9;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__22($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__22;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__22=$3;
   var $4=$tmpret162__22;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
// WARNING: content after a branch in a label, line: 3401
// WARNING: content after a branch in a label, line: 3427
function _ATSLIB_056_prelude__arrszref_get_at_size__63__9($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__9;
   var $tmp165__9=sp;
   var $tmp166__9;
   var $tmp167__9;
   var $tmp168__9;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__9;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__19($4, $5);
   $tmp166__9=$6;
   var $7=HEAP32[(($tmp165__9)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__9=$9;
   var $10=$tmp167__9;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__9;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__9($13, $14);
   $tmpret164__9=$15;
   label = 5; break;
  case 4: 
   $tmp168__9=1216;
   var $17=$tmp168__9;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__9;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__19($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__19;
   var $tmp175__19;
   var $tmp176__19;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__19=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__19=$11;
   var $12=$tmp176__19;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__19;
   $tmpret174__19=$15;
   var $16=$tmpret174__19;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__9($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__9;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__9($4, $5);
   $tmpret180__9=$6;
   var $7=$tmpret180__9;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__9($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__9;
   var $tmp183__9;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__15($4, $5);
   $tmp183__9=$6;
   var $7=$tmp183__9;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__9($7);
   $tmpret182__9=$8;
   var $9=$tmpret182__9;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__15($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__15;
   var $tmp187__15;
   var $tmp188__15;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__15=$4;
   var $5=$tmp188__15;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__15=$6;
   var $7=$1;
   var $8=$tmp187__15;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__15=$9;
   var $10=$tmpret186__15;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__9($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__9;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__9=$5;
   var $6=$tmpret192__9;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__21($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__21;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__21=$3;
   var $4=$tmpret162__21;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_size__250__3($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret619__3;
   var $tmp620__3;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=(($4+4)|0);
   var $6=HEAP32[(($5)>>2)];
   $tmp620__3=$6;
   var $7=$tmp620__3;
   $tmpret619__3=$7;
   var $8=$tmpret619__3;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__20($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__20;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__20=$3;
   var $4=$tmpret162__20;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_size__250__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret619__2;
   var $tmp620__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=(($4+4)|0);
   var $6=HEAP32[(($5)>>2)];
   $tmp620__2=$6;
   var $7=$tmp620__2;
   $tmpret619__2=$7;
   var $8=$tmpret619__2;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__19($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__19;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__19=$3;
   var $4=$tmpret162__19;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_size__250__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret619__1;
   var $tmp620__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=(($4+4)|0);
   var $6=HEAP32[(($5)>>2)];
   $tmp620__1=$6;
   var $7=$tmp620__1;
   $tmpret619__1=$7;
   var $8=$tmpret619__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__gte_g0uint_int__43__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret127__1;
   var $tmp128__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp128__1=$4;
   var $5=$1;
   var $6=$tmp128__1;
   var $7=_atspre_g0uint_gte_size($5, $6);
   $tmpret127__1=$7;
   var $8=$tmpret127__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__qsort_partition__3__1($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmpret12__1;
   var $tmp13__1;
   var $tmp14__1;
   var $tmp15__1;
   var $tmp17__1;
   var $tmp18__1;
   var $tmp19__1;
   var $tmp20__1;
   var $tmp21__1;
   var $tmp23__1;
   var $tmp25__1=sp;
   var $tmp35__1;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$2;
   var $6=$3;
   var $7=_atspre_g0uint_add_size($5, $6);
   $tmp14__1=$7;
   var $8=$tmp14__1;
   var $9=_atspre_g0uint_pred_size($8);
   $tmp13__1=$9;
   var $10=$3;
   $tmp15__1=$10;
   var $11=$tmp15__1;
   var $12=_ATSLIB_056_prelude__gt_g1int_int__51__1($11, 0);
   $tmp17__1=$12;
   var $13=$tmp17__1;
   _atspre_assert_errmsg_bool($13, ((368)|0));
   var $14=$tmp15__1;
   var $15=_ATSCNTRB_056_atshwxi_056_testing__randint__2__1($14);
   $tmp19__1=$15;
   var $16=$tmp19__1;
   $tmp18__1=$16;
   var $17=$2;
   var $18=$tmp18__1;
   var $19=_atspre_g0uint_add_size($17, $18);
   $tmp21__1=$19;
   var $20=$1;
   var $21=$tmp21__1;
   var $22=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__1($20, $21);
   $tmp20__1=$22;
   var $23=$2;
   var $24=$tmp18__1;
   var $25=_atspre_g0uint_add_size($23, $24);
   $tmp23__1=$25;
   var $26=$1;
   var $27=$tmp23__1;
   var $28=$tmp13__1;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__array0_swap__41__1($26, $27, $28);
   var $29=$2;
   var $30=(($tmp25__1)|0);
   HEAP32[(($30)>>2)]=$29;
   var $31=$3;
   var $32=(($tmp25__1+4)|0);
   HEAP32[(($32)>>2)]=$31;
   var $33=$1;
   var $34=$tmp13__1;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__qsort_partition_render__39__1($33, $tmp25__1, $34);
   var $35=$1;
   var $36=$tmp13__1;
   var $37=$tmp20__1;
   var $38=$2;
   var $39=$2;
   var $40=_loop_4__4__1($35, $36, $37, $38, $39);
   $tmp35__1=$40;
   var $41=$1;
   var $42=$tmp35__1;
   var $43=$tmp13__1;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__array0_swap__41__3($41, $42, $43);
   var $44=$tmp35__1;
   var $45=$2;
   var $46=_atspre_g0uint_sub_size($44, $45);
   $tmpret12__1=$46;
   var $47=$tmpret12__1;
   STACKTOP = sp;
   return $47;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0uint_sub_size($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=((($3)-($4))|0);
 return $5;
}
function _atspre_g0uint_add_size($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=((($3)+($4))|0);
 return $5;
}
function _ATSLIB_056_prelude__gt_g1int_int__51__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret147__1;
   var $tmp148__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp148__1=$4;
   var $5=$1;
   var $6=$tmp148__1;
   var $7=_atspre_g0int_gt_int($5, $6);
   $tmpret147__1=$7;
   var $8=$tmpret147__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSCNTRB_056_atshwxi_056_testing__randint__2__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret9__1;
   var $tmp10__1;
   var $tmp11__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=_JS_Math_random();
   $tmp11__1=$3;
   var $4=$1;
   var $5=$tmp11__1;
   var $6=_atspre_mul_int_double($4, $5);
   $tmp10__1=$6;
   var $7=$tmp10__1;
   var $8=(($7)&-1);
   $tmpret9__1=$8;
   var $9=$tmpret9__1;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__1;
   var $tmp155__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__1=$4;
   var $5=$1;
   var $6=$tmp155__1;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__1($5, $6);
   $tmpret154__1=$7;
   var $8=$tmpret154__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__array0_swap__41__1($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp110__1;
   var $tmp111__1=sp;
   var $tmp112__1;
   var $tmp114__1;
   var $tmp115__1=(sp)+(8);
   var $tmp116__1;
   var $tmp118__1;
   var $4=(sp)+(16);
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $6=$1;
   var $7=_ATSLIB_056_libats_056_ML__array0_copy__78__1($6);
   $tmp110__1=$7;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePartition_get($4);
   var $8=$tmp111__1;
   var $9=$4;
   assert(8 % 1 === 0);HEAP32[(($8)>>2)]=HEAP32[(($9)>>2)];HEAP32[((($8)+(4))>>2)]=HEAP32[((($9)+(4))>>2)];
   var $10=__057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePivot_get();
   $tmp112__1=$10;
   var $11=$2;
   var $12=(($tmp115__1)|0);
   HEAP32[(($12)>>2)]=$11;
   var $13=$3;
   var $14=(($tmp115__1+4)|0);
   HEAP32[(($14)>>2)]=$13;
   var $15=_atsruntime_malloc_libc_exn(28);
   $tmp114__1=$15;
   var $16=$tmp114__1;
   var $17=$16;
   var $18=(($17)|0);
   HEAP32[(($18)>>2)]=2;
   var $19=$tmp110__1;
   var $20=$tmp114__1;
   var $21=$20;
   var $22=(($21+4)|0);
   HEAP32[(($22)>>2)]=$19;
   var $23=$tmp114__1;
   var $24=$23;
   var $25=(($24+8)|0);
   var $26=$25;
   var $27=$tmp111__1;
   assert(8 % 1 === 0);HEAP32[(($26)>>2)]=HEAP32[(($27)>>2)];HEAP32[((($26)+(4))>>2)]=HEAP32[((($27)+(4))>>2)];
   var $28=$tmp112__1;
   var $29=$tmp114__1;
   var $30=$29;
   var $31=(($30+16)|0);
   HEAP32[(($31)>>2)]=$28;
   var $32=$tmp114__1;
   var $33=$32;
   var $34=(($33+20)|0);
   var $35=$34;
   var $36=$tmp115__1;
   assert(8 % 1 === 0);HEAP32[(($35)>>2)]=HEAP32[(($36)>>2)];HEAP32[((($35)+(4))>>2)]=HEAP32[((($36)+(4))>>2)];
   var $37=$tmp114__1;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_push($37);
   var $38=$1;
   var $39=$2;
   var $40=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__2($38, $39);
   $tmp116__1=$40;
   var $41=$1;
   var $42=$3;
   var $43=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__3($41, $42);
   $tmp118__1=$43;
   var $44=$1;
   var $45=$2;
   var $46=$tmp118__1;
   _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__1($44, $45, $46);
   var $47=$1;
   var $48=$3;
   var $49=$tmp116__1;
   _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__2($47, $48, $49);
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__qsort_partition_render__39__1($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var tempParam = $arg1; $arg1 = STACKTOP;STACKTOP = (STACKTOP + 8)|0;(assert((STACKTOP|0) < (STACK_MAX|0))|0);HEAP32[(($arg1)>>2)]=HEAP32[((tempParam)>>2)];HEAP32[((($arg1)+(4))>>2)]=HEAP32[(((tempParam)+(4))>>2)];
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmp104__1;
   var $tmp105__1;
   $1=$arg0;
   $2=$arg2;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__array0_copy__78__2($4);
   $tmp104__1=$5;
   var $6=_atsruntime_malloc_libc_exn(20);
   $tmp105__1=$6;
   var $7=$tmp105__1;
   var $8=$7;
   var $9=(($8)|0);
   HEAP32[(($9)>>2)]=1;
   var $10=$tmp104__1;
   var $11=$tmp105__1;
   var $12=$11;
   var $13=(($12+4)|0);
   HEAP32[(($13)>>2)]=$10;
   var $14=$tmp105__1;
   var $15=$14;
   var $16=(($15+8)|0);
   var $17=$16;
   var $18=$arg1;
   assert(8 % 1 === 0);HEAP32[(($17)>>2)]=HEAP32[(($18)>>2)];HEAP32[((($17)+(4))>>2)]=HEAP32[((($18)+(4))>>2)];
   var $19=$2;
   var $20=$tmp105__1;
   var $21=$20;
   var $22=(($21+16)|0);
   HEAP32[(($22)>>2)]=$19;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePartition_set($arg1);
   var $23=$2;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePivot_set($23);
   var $24=$tmp105__1;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_push($24);
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _loop_4__4__1($env0, $env1, $env2, $arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $4;
   var $5;
   var $argx0;
   var $argx1;
   var $tmpret26__1;
   var $tmp27__1;
   var $tmp28__1;
   var $tmp29__1;
   var $tmp30__1;
   var $tmp31__1;
   var $tmp33__1;
   var $tmp34__1;
   $1=$env0;
   $2=$env1;
   $3=$env2;
   $4=$arg0;
   $5=$arg1;
   label = 2; break;
  case 2: 
   var $7=$5;
   var $8=$2;
   var $9=_atspre_g0uint_lt_size($7, $8);
   $tmp27__1=$9;
   var $10=$tmp27__1;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 9; break; }
  case 3: 
   var $13=$1;
   var $14=$5;
   var $15=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__4($13, $14);
   $tmp29__1=$15;
   var $16=$3;
   var $17=$tmp29__1;
   var $18=_ATSLIB_056_prelude__gcompare_val__1__1($16, $17);
   $tmp28__1=$18;
   var $19=$tmp28__1;
   var $20=_ATSLIB_056_prelude__lte_g0int_int__153__1($19, 0);
   $tmp30__1=$20;
   var $21=$tmp30__1;
   var $22=(($21)|(0))!=0;
   if ($22) { label = 4; break; } else { label = 6; break; }
  case 4: 
   var $24=$5;
   var $25=_atspre_g0uint_succ_size($24);
   $tmp31__1=$25;
   label = 5; break;
  case 5: 
   var $27=$4;
   $argx0=$27;
   var $28=$tmp31__1;
   $argx1=$28;
   var $29=$argx0;
   $4=$29;
   var $30=$argx1;
   $5=$30;
   label = 2; break;
  case 6: 
   var $33=$1;
   var $34=$4;
   var $35=$5;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__array0_swap__41__2($33, $34, $35);
   var $36=$4;
   var $37=_atspre_g0uint_succ_size($36);
   $tmp33__1=$37;
   var $38=$5;
   var $39=_atspre_g0uint_succ_size($38);
   $tmp34__1=$39;
   label = 7; break;
  case 7: 
   var $41=$tmp33__1;
   $argx0=$41;
   var $42=$tmp34__1;
   $argx1=$42;
   var $43=$argx0;
   $4=$43;
   var $44=$argx1;
   $5=$44;
   label = 2; break;
  case 8: 
   label = 10; break;
  case 9: 
   var $48=$4;
   $tmpret26__1=$48;
   label = 10; break;
  case 10: 
   var $50=$tmpret26__1;
   return $50;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__array0_swap__41__3($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp110__3;
   var $tmp111__3=sp;
   var $tmp112__3;
   var $tmp114__3;
   var $tmp115__3=(sp)+(8);
   var $tmp116__3;
   var $tmp118__3;
   var $4=(sp)+(16);
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $6=$1;
   var $7=_ATSLIB_056_libats_056_ML__array0_copy__78__4($6);
   $tmp110__3=$7;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePartition_get($4);
   var $8=$tmp111__3;
   var $9=$4;
   assert(8 % 1 === 0);HEAP32[(($8)>>2)]=HEAP32[(($9)>>2)];HEAP32[((($8)+(4))>>2)]=HEAP32[((($9)+(4))>>2)];
   var $10=__057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePivot_get();
   $tmp112__3=$10;
   var $11=$2;
   var $12=(($tmp115__3)|0);
   HEAP32[(($12)>>2)]=$11;
   var $13=$3;
   var $14=(($tmp115__3+4)|0);
   HEAP32[(($14)>>2)]=$13;
   var $15=_atsruntime_malloc_libc_exn(28);
   $tmp114__3=$15;
   var $16=$tmp114__3;
   var $17=$16;
   var $18=(($17)|0);
   HEAP32[(($18)>>2)]=2;
   var $19=$tmp110__3;
   var $20=$tmp114__3;
   var $21=$20;
   var $22=(($21+4)|0);
   HEAP32[(($22)>>2)]=$19;
   var $23=$tmp114__3;
   var $24=$23;
   var $25=(($24+8)|0);
   var $26=$25;
   var $27=$tmp111__3;
   assert(8 % 1 === 0);HEAP32[(($26)>>2)]=HEAP32[(($27)>>2)];HEAP32[((($26)+(4))>>2)]=HEAP32[((($27)+(4))>>2)];
   var $28=$tmp112__3;
   var $29=$tmp114__3;
   var $30=$29;
   var $31=(($30+16)|0);
   HEAP32[(($31)>>2)]=$28;
   var $32=$tmp114__3;
   var $33=$32;
   var $34=(($33+20)|0);
   var $35=$34;
   var $36=$tmp115__3;
   assert(8 % 1 === 0);HEAP32[(($35)>>2)]=HEAP32[(($36)>>2)];HEAP32[((($35)+(4))>>2)]=HEAP32[((($36)+(4))>>2)];
   var $37=$tmp114__3;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_push($37);
   var $38=$1;
   var $39=$2;
   var $40=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__7($38, $39);
   $tmp116__3=$40;
   var $41=$1;
   var $42=$3;
   var $43=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__8($41, $42);
   $tmp118__3=$43;
   var $44=$1;
   var $45=$2;
   var $46=$tmp118__3;
   _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__5($44, $45, $46);
   var $47=$1;
   var $48=$3;
   var $49=$tmp116__3;
   _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__6($47, $48, $49);
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_copy__78__4($arg0) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret204__4;
   var $tmp205__4;
   var $tmp206__4=sp;
   var $tmp207__4;
   var $tmp208__4;
   var $tmp210__4;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__14($3);
   $tmp205__4=$4;
   var $5=$tmp205__4;
   var $6=$tmp206__4;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__14($5, $6);
   $tmp207__4=$7;
   var $8=HEAP32[(($tmp206__4)>>2)];
   var $9=_ATSLIB_056_prelude__array_ptr_alloc__82__4($8);
   $tmp208__4=$9;
   var $10=$tmp208__4;
   var $11=$tmp207__4;
   var $12=HEAP32[(($tmp206__4)>>2)];
   _ATSLIB_056_prelude__array_copy__85__4($10, $11, $12);
   var $13=$tmp208__4;
   var $14=HEAP32[(($tmp206__4)>>2)];
   var $15=_ATSLIB_056_prelude__arrszref_make_arrayref__87__4($13, $14);
   $tmp210__4=$15;
   var $16=$tmp210__4;
   var $17=_ATSLIB_056_libats_056_ML__array0_of_arrszref__89__4($16);
   $tmpret204__4=$17;
   var $18=$tmpret204__4;
   STACKTOP = sp;
   return $18;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__7($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__7;
   var $tmp155__7;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__7=$4;
   var $5=$1;
   var $6=$tmp155__7;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__7($5, $6);
   $tmpret154__7=$7;
   var $8=$tmpret154__7;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__8($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__8;
   var $tmp155__8;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__8=$4;
   var $5=$1;
   var $6=$tmp155__8;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__8($5, $6);
   $tmpret154__8=$7;
   var $8=$tmpret154__8;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__5($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp281__5;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$2;
   $tmp281__5=$5;
   var $6=$1;
   var $7=$tmp281__5;
   var $8=$3;
   _ATSLIB_056_libats_056_ML__array0_set_at_size__111__5($6, $7, $8);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__6($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp281__6;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$2;
   $tmp281__6=$5;
   var $6=$1;
   var $7=$tmp281__6;
   var $8=$3;
   _ATSLIB_056_libats_056_ML__array0_set_at_size__111__6($6, $7, $8);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_size__111__6($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp285__6;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__18($5);
   $tmp285__6=$6;
   var $7=$tmp285__6;
   var $8=$2;
   var $9=$3;
   _ATSLIB_056_prelude__arrszref_set_at_size__114__6($7, $8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__18($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__18;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__18=$3;
   var $4=$tmpret162__18;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_set_at_size__114__6($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp290__6=sp;
   var $tmp291__6;
   var $tmp292__6;
   var $tmp293__6;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$tmp290__6;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__18($5, $6);
   $tmp291__6=$7;
   var $8=HEAP32[(($tmp290__6)>>2)];
   var $9=$2;
   var $10=_atspre_g0uint_gt_size($8, $9);
   $tmp292__6=$10;
   var $11=$tmp292__6;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $14=$tmp291__6;
   var $15=$2;
   var $16=$3;
   _ATSLIB_056_prelude__arrayref_set_at_guint__117__6($14, $15, $16);
   label = 5; break;
  case 4: 
   $tmp293__6=1216;
   var $18=$tmp293__6;
   var $19=$18;
   _atsruntime_raise($19);
   label = 5; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__18($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__18;
   var $tmp175__18;
   var $tmp176__18;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__18=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__18=$11;
   var $12=$tmp176__18;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__18;
   $tmpret174__18=$15;
   var $16=$tmpret174__18;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_set_at_guint__117__6($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=$3;
   _ATSLIB_056_prelude__array_set_at_guint__119__6($5, $6, $7);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_set_at_guint__119__6($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp305__6;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=_ATSLIB_056_prelude__ptr0_add_guint__72__14($5, $6);
   $tmp305__6=$7;
   var $8=$tmp305__6;
   var $9=$3;
   _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__6($8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__14($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__14;
   var $tmp187__14;
   var $tmp188__14;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__14=$4;
   var $5=$tmp188__14;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__14=$6;
   var $7=$1;
   var $8=$tmp187__14;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__14=$9;
   var $10=$tmpret186__14;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__6($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=$1;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_size__111__5($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp285__5;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__17($5);
   $tmp285__5=$6;
   var $7=$tmp285__5;
   var $8=$2;
   var $9=$3;
   _ATSLIB_056_prelude__arrszref_set_at_size__114__5($7, $8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__17($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__17;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__17=$3;
   var $4=$tmpret162__17;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_set_at_size__114__5($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp290__5=sp;
   var $tmp291__5;
   var $tmp292__5;
   var $tmp293__5;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$tmp290__5;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__17($5, $6);
   $tmp291__5=$7;
   var $8=HEAP32[(($tmp290__5)>>2)];
   var $9=$2;
   var $10=_atspre_g0uint_gt_size($8, $9);
   $tmp292__5=$10;
   var $11=$tmp292__5;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $14=$tmp291__5;
   var $15=$2;
   var $16=$3;
   _ATSLIB_056_prelude__arrayref_set_at_guint__117__5($14, $15, $16);
   label = 5; break;
  case 4: 
   $tmp293__5=1216;
   var $18=$tmp293__5;
   var $19=$18;
   _atsruntime_raise($19);
   label = 5; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__17($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__17;
   var $tmp175__17;
   var $tmp176__17;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__17=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__17=$11;
   var $12=$tmp176__17;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__17;
   $tmpret174__17=$15;
   var $16=$tmpret174__17;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_set_at_guint__117__5($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=$3;
   _ATSLIB_056_prelude__array_set_at_guint__119__5($5, $6, $7);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_set_at_guint__119__5($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp305__5;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=_ATSLIB_056_prelude__ptr0_add_guint__72__13($5, $6);
   $tmp305__5=$7;
   var $8=$tmp305__5;
   var $9=$3;
   _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__5($8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__13($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__13;
   var $tmp187__13;
   var $tmp188__13;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__13=$4;
   var $5=$tmp188__13;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__13=$6;
   var $7=$1;
   var $8=$tmp187__13;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__13=$9;
   var $10=$tmpret186__13;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__5($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=$1;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__8($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__8;
   var $tmp159__8;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__16($4);
   $tmp159__8=$5;
   var $6=$tmp159__8;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__8($6, $7);
   $tmpret158__8=$8;
   var $9=$tmpret158__8;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__16($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__16;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__16=$3;
   var $4=$tmpret162__16;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__8($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__8;
   var $tmp165__8=sp;
   var $tmp166__8;
   var $tmp167__8;
   var $tmp168__8;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__8;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__16($4, $5);
   $tmp166__8=$6;
   var $7=HEAP32[(($tmp165__8)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__8=$9;
   var $10=$tmp167__8;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__8;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__8($13, $14);
   $tmpret164__8=$15;
   label = 5; break;
  case 4: 
   $tmp168__8=1216;
   var $17=$tmp168__8;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__8;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__16($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__16;
   var $tmp175__16;
   var $tmp176__16;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__16=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__16=$11;
   var $12=$tmp176__16;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__16;
   $tmpret174__16=$15;
   var $16=$tmpret174__16;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__8($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__8;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__8($4, $5);
   $tmpret180__8=$6;
   var $7=$tmpret180__8;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__8($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__8;
   var $tmp183__8;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__12($4, $5);
   $tmp183__8=$6;
   var $7=$tmp183__8;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__8($7);
   $tmpret182__8=$8;
   var $9=$tmpret182__8;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__12($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__12;
   var $tmp187__12;
   var $tmp188__12;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__12=$4;
   var $5=$tmp188__12;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__12=$6;
   var $7=$1;
   var $8=$tmp187__12;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__12=$9;
   var $10=$tmpret186__12;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__8($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__8;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__8=$5;
   var $6=$tmpret192__8;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__7($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__7;
   var $tmp159__7;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__15($4);
   $tmp159__7=$5;
   var $6=$tmp159__7;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__7($6, $7);
   $tmpret158__7=$8;
   var $9=$tmpret158__7;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__15($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__15;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__15=$3;
   var $4=$tmpret162__15;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__7($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__7;
   var $tmp165__7=sp;
   var $tmp166__7;
   var $tmp167__7;
   var $tmp168__7;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__7;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__15($4, $5);
   $tmp166__7=$6;
   var $7=HEAP32[(($tmp165__7)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__7=$9;
   var $10=$tmp167__7;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__7;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__7($13, $14);
   $tmpret164__7=$15;
   label = 5; break;
  case 4: 
   $tmp168__7=1216;
   var $17=$tmp168__7;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__7;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__15($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__15;
   var $tmp175__15;
   var $tmp176__15;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__15=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__15=$11;
   var $12=$tmp176__15;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__15;
   $tmpret174__15=$15;
   var $16=$tmpret174__15;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__7($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__7;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__7($4, $5);
   $tmpret180__7=$6;
   var $7=$tmpret180__7;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__7($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__7;
   var $tmp183__7;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__11($4, $5);
   $tmp183__7=$6;
   var $7=$tmp183__7;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__7($7);
   $tmpret182__7=$8;
   var $9=$tmpret182__7;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__11($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__11;
   var $tmp187__11;
   var $tmp188__11;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__11=$4;
   var $5=$tmp188__11;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__11=$6;
   var $7=$1;
   var $8=$tmp187__11;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__11=$9;
   var $10=$tmpret186__11;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__7($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__7;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__7=$5;
   var $6=$tmpret192__7;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__14($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__14;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__14=$3;
   var $4=$tmpret162__14;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__14($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__14;
   var $tmp175__14;
   var $tmp176__14;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__14=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__14=$11;
   var $12=$tmp176__14;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__14;
   $tmpret174__14=$15;
   var $16=$tmpret174__14;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_ptr_alloc__82__4($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret222__4;
   var $tmp223__4;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_g0uint_mul_size($3, 4);
   $tmp223__4=$4;
   var $5=$tmp223__4;
   var $6=_atsruntime_malloc_libc_exn($5);
   $tmpret222__4=$6;
   var $7=$tmpret222__4;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_copy__85__4($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp227__4;
   var $tmp228__4;
   var $tmp229__4;
   var $tmp230__4;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   $tmp227__4=$5;
   var $6=$2;
   $tmp228__4=$6;
   var $7=$3;
   var $8=_atspre_g0uint_mul_size($7, 4);
   $tmp230__4=$8;
   var $9=$tmp227__4;
   var $10=$tmp228__4;
   var $11=$tmp230__4;
   assert($11 % 1 === 0);(_memcpy($9, $10, $11)|0);
   $tmp229__4=$9;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_make_arrayref__87__4($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret236__4;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=_atsruntime_malloc_libc_exn(8);
   $tmpret236__4=$4;
   var $5=$1;
   var $6=$tmpret236__4;
   var $7=$6;
   var $8=(($7)|0);
   HEAP32[(($8)>>2)]=$5;
   var $9=$2;
   var $10=$tmpret236__4;
   var $11=$10;
   var $12=(($11+4)|0);
   HEAP32[(($12)>>2)]=$9;
   var $13=$tmpret236__4;
   return $13;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_of_arrszref__89__4($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret238__4;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret238__4=$3;
   var $4=$tmpret238__4;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__4($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__4;
   var $tmp155__4;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__4=$4;
   var $5=$1;
   var $6=$tmp155__4;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__4($5, $6);
   $tmpret154__4=$7;
   var $8=$tmpret154__4;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__gcompare_val__1__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret8__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_atspre_g0int_compare_int($4, $5);
   $tmpret8__1=$6;
   var $7=$tmpret8__1;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__lte_g0int_int__153__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret388__1;
   var $tmp389__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp389__1=$4;
   var $5=$1;
   var $6=$tmp389__1;
   var $7=_atspre_g0int_lte_int($5, $6);
   $tmpret388__1=$7;
   var $8=$tmpret388__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__array0_swap__41__2($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp110__2;
   var $tmp111__2=sp;
   var $tmp112__2;
   var $tmp114__2;
   var $tmp115__2=(sp)+(8);
   var $tmp116__2;
   var $tmp118__2;
   var $4=(sp)+(16);
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $6=$1;
   var $7=_ATSLIB_056_libats_056_ML__array0_copy__78__3($6);
   $tmp110__2=$7;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePartition_get($4);
   var $8=$tmp111__2;
   var $9=$4;
   assert(8 % 1 === 0);HEAP32[(($8)>>2)]=HEAP32[(($9)>>2)];HEAP32[((($8)+(4))>>2)]=HEAP32[((($9)+(4))>>2)];
   var $10=__057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__thePivot_get();
   $tmp112__2=$10;
   var $11=$2;
   var $12=(($tmp115__2)|0);
   HEAP32[(($12)>>2)]=$11;
   var $13=$3;
   var $14=(($tmp115__2+4)|0);
   HEAP32[(($14)>>2)]=$13;
   var $15=_atsruntime_malloc_libc_exn(28);
   $tmp114__2=$15;
   var $16=$tmp114__2;
   var $17=$16;
   var $18=(($17)|0);
   HEAP32[(($18)>>2)]=2;
   var $19=$tmp110__2;
   var $20=$tmp114__2;
   var $21=$20;
   var $22=(($21+4)|0);
   HEAP32[(($22)>>2)]=$19;
   var $23=$tmp114__2;
   var $24=$23;
   var $25=(($24+8)|0);
   var $26=$25;
   var $27=$tmp111__2;
   assert(8 % 1 === 0);HEAP32[(($26)>>2)]=HEAP32[(($27)>>2)];HEAP32[((($26)+(4))>>2)]=HEAP32[((($27)+(4))>>2)];
   var $28=$tmp112__2;
   var $29=$tmp114__2;
   var $30=$29;
   var $31=(($30+16)|0);
   HEAP32[(($31)>>2)]=$28;
   var $32=$tmp114__2;
   var $33=$32;
   var $34=(($33+20)|0);
   var $35=$34;
   var $36=$tmp115__2;
   assert(8 % 1 === 0);HEAP32[(($35)>>2)]=HEAP32[(($36)>>2)];HEAP32[((($35)+(4))>>2)]=HEAP32[((($36)+(4))>>2)];
   var $37=$tmp114__2;
   __057_scratch_057_opt_057_postiats_057_doc_057_PROJECT_057_MEDIUM_057_Algorianim_057_quicksort_057_quicksort_anim_056_dats__snapshot_push($37);
   var $38=$1;
   var $39=$2;
   var $40=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__5($38, $39);
   $tmp116__2=$40;
   var $41=$1;
   var $42=$3;
   var $43=_ATSLIB_056_libats_056_ML__array0_get_at_guint__56__6($41, $42);
   $tmp118__2=$43;
   var $44=$1;
   var $45=$2;
   var $46=$tmp118__2;
   _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__3($44, $45, $46);
   var $47=$1;
   var $48=$3;
   var $49=$tmp116__2;
   _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__4($47, $48, $49);
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_copy__78__3($arg0) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret204__3;
   var $tmp205__3;
   var $tmp206__3=sp;
   var $tmp207__3;
   var $tmp208__3;
   var $tmp210__3;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__9($3);
   $tmp205__3=$4;
   var $5=$tmp205__3;
   var $6=$tmp206__3;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__9($5, $6);
   $tmp207__3=$7;
   var $8=HEAP32[(($tmp206__3)>>2)];
   var $9=_ATSLIB_056_prelude__array_ptr_alloc__82__3($8);
   $tmp208__3=$9;
   var $10=$tmp208__3;
   var $11=$tmp207__3;
   var $12=HEAP32[(($tmp206__3)>>2)];
   _ATSLIB_056_prelude__array_copy__85__3($10, $11, $12);
   var $13=$tmp208__3;
   var $14=HEAP32[(($tmp206__3)>>2)];
   var $15=_ATSLIB_056_prelude__arrszref_make_arrayref__87__3($13, $14);
   $tmp210__3=$15;
   var $16=$tmp210__3;
   var $17=_ATSLIB_056_libats_056_ML__array0_of_arrszref__89__3($16);
   $tmpret204__3=$17;
   var $18=$tmpret204__3;
   STACKTOP = sp;
   return $18;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__5($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__5;
   var $tmp155__5;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__5=$4;
   var $5=$1;
   var $6=$tmp155__5;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__5($5, $6);
   $tmpret154__5=$7;
   var $8=$tmpret154__5;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__6($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__6;
   var $tmp155__6;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__6=$4;
   var $5=$1;
   var $6=$tmp155__6;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__6($5, $6);
   $tmpret154__6=$7;
   var $8=$tmpret154__6;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__3($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp281__3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$2;
   $tmp281__3=$5;
   var $6=$1;
   var $7=$tmp281__3;
   var $8=$3;
   _ATSLIB_056_libats_056_ML__array0_set_at_size__111__3($6, $7, $8);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__4($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp281__4;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$2;
   $tmp281__4=$5;
   var $6=$1;
   var $7=$tmp281__4;
   var $8=$3;
   _ATSLIB_056_libats_056_ML__array0_set_at_size__111__4($6, $7, $8);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_size__111__4($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp285__4;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__13($5);
   $tmp285__4=$6;
   var $7=$tmp285__4;
   var $8=$2;
   var $9=$3;
   _ATSLIB_056_prelude__arrszref_set_at_size__114__4($7, $8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__13($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__13;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__13=$3;
   var $4=$tmpret162__13;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_set_at_size__114__4($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp290__4=sp;
   var $tmp291__4;
   var $tmp292__4;
   var $tmp293__4;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$tmp290__4;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__13($5, $6);
   $tmp291__4=$7;
   var $8=HEAP32[(($tmp290__4)>>2)];
   var $9=$2;
   var $10=_atspre_g0uint_gt_size($8, $9);
   $tmp292__4=$10;
   var $11=$tmp292__4;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $14=$tmp291__4;
   var $15=$2;
   var $16=$3;
   _ATSLIB_056_prelude__arrayref_set_at_guint__117__4($14, $15, $16);
   label = 5; break;
  case 4: 
   $tmp293__4=1216;
   var $18=$tmp293__4;
   var $19=$18;
   _atsruntime_raise($19);
   label = 5; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__13($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__13;
   var $tmp175__13;
   var $tmp176__13;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__13=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__13=$11;
   var $12=$tmp176__13;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__13;
   $tmpret174__13=$15;
   var $16=$tmpret174__13;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_set_at_guint__117__4($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=$3;
   _ATSLIB_056_prelude__array_set_at_guint__119__4($5, $6, $7);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_set_at_guint__119__4($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp305__4;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=_ATSLIB_056_prelude__ptr0_add_guint__72__10($5, $6);
   $tmp305__4=$7;
   var $8=$tmp305__4;
   var $9=$3;
   _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__4($8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__10($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__10;
   var $tmp187__10;
   var $tmp188__10;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__10=$4;
   var $5=$tmp188__10;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__10=$6;
   var $7=$1;
   var $8=$tmp187__10;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__10=$9;
   var $10=$tmpret186__10;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__4($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=$1;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_size__111__3($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp285__3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__12($5);
   $tmp285__3=$6;
   var $7=$tmp285__3;
   var $8=$2;
   var $9=$3;
   _ATSLIB_056_prelude__arrszref_set_at_size__114__3($7, $8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__12($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__12;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__12=$3;
   var $4=$tmpret162__12;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_set_at_size__114__3($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp290__3=sp;
   var $tmp291__3;
   var $tmp292__3;
   var $tmp293__3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$tmp290__3;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__12($5, $6);
   $tmp291__3=$7;
   var $8=HEAP32[(($tmp290__3)>>2)];
   var $9=$2;
   var $10=_atspre_g0uint_gt_size($8, $9);
   $tmp292__3=$10;
   var $11=$tmp292__3;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $14=$tmp291__3;
   var $15=$2;
   var $16=$3;
   _ATSLIB_056_prelude__arrayref_set_at_guint__117__3($14, $15, $16);
   label = 5; break;
  case 4: 
   $tmp293__3=1216;
   var $18=$tmp293__3;
   var $19=$18;
   _atsruntime_raise($19);
   label = 5; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__12($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__12;
   var $tmp175__12;
   var $tmp176__12;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__12=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__12=$11;
   var $12=$tmp176__12;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__12;
   $tmpret174__12=$15;
   var $16=$tmpret174__12;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_set_at_guint__117__3($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=$3;
   _ATSLIB_056_prelude__array_set_at_guint__119__3($5, $6, $7);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_set_at_guint__119__3($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp305__3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=_ATSLIB_056_prelude__ptr0_add_guint__72__9($5, $6);
   $tmp305__3=$7;
   var $8=$tmp305__3;
   var $9=$3;
   _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__3($8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__9($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__9;
   var $tmp187__9;
   var $tmp188__9;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__9=$4;
   var $5=$tmp188__9;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__9=$6;
   var $7=$1;
   var $8=$tmp187__9;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__9=$9;
   var $10=$tmpret186__9;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__3($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=$1;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__6($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__6;
   var $tmp159__6;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__11($4);
   $tmp159__6=$5;
   var $6=$tmp159__6;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__6($6, $7);
   $tmpret158__6=$8;
   var $9=$tmpret158__6;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__11($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__11;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__11=$3;
   var $4=$tmpret162__11;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__6($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__6;
   var $tmp165__6=sp;
   var $tmp166__6;
   var $tmp167__6;
   var $tmp168__6;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__6;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__11($4, $5);
   $tmp166__6=$6;
   var $7=HEAP32[(($tmp165__6)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__6=$9;
   var $10=$tmp167__6;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__6;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__6($13, $14);
   $tmpret164__6=$15;
   label = 5; break;
  case 4: 
   $tmp168__6=1216;
   var $17=$tmp168__6;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__6;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__11($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__11;
   var $tmp175__11;
   var $tmp176__11;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__11=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__11=$11;
   var $12=$tmp176__11;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__11;
   $tmpret174__11=$15;
   var $16=$tmpret174__11;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__6($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__6;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__6($4, $5);
   $tmpret180__6=$6;
   var $7=$tmpret180__6;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__6($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__6;
   var $tmp183__6;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__8($4, $5);
   $tmp183__6=$6;
   var $7=$tmp183__6;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__6($7);
   $tmpret182__6=$8;
   var $9=$tmpret182__6;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__8($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__8;
   var $tmp187__8;
   var $tmp188__8;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__8=$4;
   var $5=$tmp188__8;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__8=$6;
   var $7=$1;
   var $8=$tmp187__8;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__8=$9;
   var $10=$tmpret186__8;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__6($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__6;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__6=$5;
   var $6=$tmpret192__6;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__5($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__5;
   var $tmp159__5;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__10($4);
   $tmp159__5=$5;
   var $6=$tmp159__5;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__5($6, $7);
   $tmpret158__5=$8;
   var $9=$tmpret158__5;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__10($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__10;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__10=$3;
   var $4=$tmpret162__10;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__5($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__5;
   var $tmp165__5=sp;
   var $tmp166__5;
   var $tmp167__5;
   var $tmp168__5;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__5;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__10($4, $5);
   $tmp166__5=$6;
   var $7=HEAP32[(($tmp165__5)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__5=$9;
   var $10=$tmp167__5;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__5;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__5($13, $14);
   $tmpret164__5=$15;
   label = 5; break;
  case 4: 
   $tmp168__5=1216;
   var $17=$tmp168__5;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__5;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__10($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__10;
   var $tmp175__10;
   var $tmp176__10;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__10=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__10=$11;
   var $12=$tmp176__10;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__10;
   $tmpret174__10=$15;
   var $16=$tmpret174__10;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__5($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__5;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__5($4, $5);
   $tmpret180__5=$6;
   var $7=$tmpret180__5;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__5($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__5;
   var $tmp183__5;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__7($4, $5);
   $tmp183__5=$6;
   var $7=$tmp183__5;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__5($7);
   $tmpret182__5=$8;
   var $9=$tmpret182__5;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__7($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__7;
   var $tmp187__7;
   var $tmp188__7;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__7=$4;
   var $5=$tmp188__7;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__7=$6;
   var $7=$1;
   var $8=$tmp187__7;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__7=$9;
   var $10=$tmpret186__7;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__5($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__5;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__5=$5;
   var $6=$tmpret192__5;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__9($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__9;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__9=$3;
   var $4=$tmpret162__9;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__9($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__9;
   var $tmp175__9;
   var $tmp176__9;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__9=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__9=$11;
   var $12=$tmp176__9;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__9;
   $tmpret174__9=$15;
   var $16=$tmpret174__9;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_ptr_alloc__82__3($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret222__3;
   var $tmp223__3;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_g0uint_mul_size($3, 4);
   $tmp223__3=$4;
   var $5=$tmp223__3;
   var $6=_atsruntime_malloc_libc_exn($5);
   $tmpret222__3=$6;
   var $7=$tmpret222__3;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_copy__85__3($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp227__3;
   var $tmp228__3;
   var $tmp229__3;
   var $tmp230__3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   $tmp227__3=$5;
   var $6=$2;
   $tmp228__3=$6;
   var $7=$3;
   var $8=_atspre_g0uint_mul_size($7, 4);
   $tmp230__3=$8;
   var $9=$tmp227__3;
   var $10=$tmp228__3;
   var $11=$tmp230__3;
   assert($11 % 1 === 0);(_memcpy($9, $10, $11)|0);
   $tmp229__3=$9;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_make_arrayref__87__3($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret236__3;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=_atsruntime_malloc_libc_exn(8);
   $tmpret236__3=$4;
   var $5=$1;
   var $6=$tmpret236__3;
   var $7=$6;
   var $8=(($7)|0);
   HEAP32[(($8)>>2)]=$5;
   var $9=$2;
   var $10=$tmpret236__3;
   var $11=$10;
   var $12=(($11+4)|0);
   HEAP32[(($12)>>2)]=$9;
   var $13=$tmpret236__3;
   return $13;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_of_arrszref__89__3($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret238__3;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret238__3=$3;
   var $4=$tmpret238__3;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _atspre_g0int_lte_int($x1, $x2) {
 var label = 0;
 var $1;
 var $2;
 $1=$x1;
 $2=$x2;
 var $3=$1;
 var $4=$2;
 var $5=(($3)|(0)) <= (($4)|(0));
 var $6=$5 ? 1 : 0;
 return $6;
}
function _atspre_g0int_compare_int($x1, $x2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $2=$x1;
   $3=$x2;
   var $4=$2;
   var $5=$3;
   var $6=(($4)|(0)) < (($5)|(0));
   if ($6) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $1=-1;
   label = 6; break;
  case 3: 
   var $9=$2;
   var $10=$3;
   var $11=(($9)|(0)) > (($10)|(0));
   if ($11) { label = 4; break; } else { label = 5; break; }
  case 4: 
   $1=1;
   label = 6; break;
  case 5: 
   $1=0;
   label = 6; break;
  case 6: 
   var $15=$1;
   return $15;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__4($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__4;
   var $tmp159__4;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__8($4);
   $tmp159__4=$5;
   var $6=$tmp159__4;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__4($6, $7);
   $tmpret158__4=$8;
   var $9=$tmpret158__4;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__8($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__8;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__8=$3;
   var $4=$tmpret162__8;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__4($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__4;
   var $tmp165__4=sp;
   var $tmp166__4;
   var $tmp167__4;
   var $tmp168__4;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__4;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__8($4, $5);
   $tmp166__4=$6;
   var $7=HEAP32[(($tmp165__4)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__4=$9;
   var $10=$tmp167__4;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__4;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__4($13, $14);
   $tmpret164__4=$15;
   label = 5; break;
  case 4: 
   $tmp168__4=1216;
   var $17=$tmp168__4;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__4;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__8($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__8;
   var $tmp175__8;
   var $tmp176__8;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__8=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__8=$11;
   var $12=$tmp176__8;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__8;
   $tmpret174__8=$15;
   var $16=$tmpret174__8;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__4($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__4;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__4($4, $5);
   $tmpret180__4=$6;
   var $7=$tmpret180__4;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__4($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__4;
   var $tmp183__4;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__6($4, $5);
   $tmp183__4=$6;
   var $7=$tmp183__4;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__4($7);
   $tmpret182__4=$8;
   var $9=$tmpret182__4;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__6($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__6;
   var $tmp187__6;
   var $tmp188__6;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__6=$4;
   var $5=$tmp188__6;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__6=$6;
   var $7=$1;
   var $8=$tmp187__6;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__6=$9;
   var $10=$tmpret186__6;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__4($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__4;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__4=$5;
   var $6=$tmpret192__4;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_copy__78__2($arg0) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret204__2;
   var $tmp205__2;
   var $tmp206__2=sp;
   var $tmp207__2;
   var $tmp208__2;
   var $tmp210__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__7($3);
   $tmp205__2=$4;
   var $5=$tmp205__2;
   var $6=$tmp206__2;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__7($5, $6);
   $tmp207__2=$7;
   var $8=HEAP32[(($tmp206__2)>>2)];
   var $9=_ATSLIB_056_prelude__array_ptr_alloc__82__2($8);
   $tmp208__2=$9;
   var $10=$tmp208__2;
   var $11=$tmp207__2;
   var $12=HEAP32[(($tmp206__2)>>2)];
   _ATSLIB_056_prelude__array_copy__85__2($10, $11, $12);
   var $13=$tmp208__2;
   var $14=HEAP32[(($tmp206__2)>>2)];
   var $15=_ATSLIB_056_prelude__arrszref_make_arrayref__87__2($13, $14);
   $tmp210__2=$15;
   var $16=$tmp210__2;
   var $17=_ATSLIB_056_libats_056_ML__array0_of_arrszref__89__2($16);
   $tmpret204__2=$17;
   var $18=$tmpret204__2;
   STACKTOP = sp;
   return $18;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__7($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__7;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__7=$3;
   var $4=$tmpret162__7;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__7($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__7;
   var $tmp175__7;
   var $tmp176__7;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__7=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__7=$11;
   var $12=$tmp176__7;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__7;
   $tmpret174__7=$15;
   var $16=$tmpret174__7;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_ptr_alloc__82__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret222__2;
   var $tmp223__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_g0uint_mul_size($3, 4);
   $tmp223__2=$4;
   var $5=$tmp223__2;
   var $6=_atsruntime_malloc_libc_exn($5);
   $tmpret222__2=$6;
   var $7=$tmpret222__2;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_copy__85__2($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp227__2;
   var $tmp228__2;
   var $tmp229__2;
   var $tmp230__2;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   $tmp227__2=$5;
   var $6=$2;
   $tmp228__2=$6;
   var $7=$3;
   var $8=_atspre_g0uint_mul_size($7, 4);
   $tmp230__2=$8;
   var $9=$tmp227__2;
   var $10=$tmp228__2;
   var $11=$tmp230__2;
   assert($11 % 1 === 0);(_memcpy($9, $10, $11)|0);
   $tmp229__2=$9;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_make_arrayref__87__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret236__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=_atsruntime_malloc_libc_exn(8);
   $tmpret236__2=$4;
   var $5=$1;
   var $6=$tmpret236__2;
   var $7=$6;
   var $8=(($7)|0);
   HEAP32[(($8)>>2)]=$5;
   var $9=$2;
   var $10=$tmpret236__2;
   var $11=$10;
   var $12=(($11+4)|0);
   HEAP32[(($12)>>2)]=$9;
   var $13=$tmpret236__2;
   return $13;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_of_arrszref__89__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret238__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret238__2=$3;
   var $4=$tmpret238__2;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_copy__78__1($arg0) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret204__1;
   var $tmp205__1;
   var $tmp206__1=sp;
   var $tmp207__1;
   var $tmp208__1;
   var $tmp210__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__2($3);
   $tmp205__1=$4;
   var $5=$tmp205__1;
   var $6=$tmp206__1;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__2($5, $6);
   $tmp207__1=$7;
   var $8=HEAP32[(($tmp206__1)>>2)];
   var $9=_ATSLIB_056_prelude__array_ptr_alloc__82__1($8);
   $tmp208__1=$9;
   var $10=$tmp208__1;
   var $11=$tmp207__1;
   var $12=HEAP32[(($tmp206__1)>>2)];
   _ATSLIB_056_prelude__array_copy__85__1($10, $11, $12);
   var $13=$tmp208__1;
   var $14=HEAP32[(($tmp206__1)>>2)];
   var $15=_ATSLIB_056_prelude__arrszref_make_arrayref__87__1($13, $14);
   $tmp210__1=$15;
   var $16=$tmp210__1;
   var $17=_ATSLIB_056_libats_056_ML__array0_of_arrszref__89__1($16);
   $tmpret204__1=$17;
   var $18=$tmpret204__1;
   STACKTOP = sp;
   return $18;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__2;
   var $tmp155__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__2=$4;
   var $5=$1;
   var $6=$tmp155__2;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__2($5, $6);
   $tmpret154__2=$7;
   var $8=$tmpret154__2;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_guint__56__3($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret154__3;
   var $tmp155__3;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp155__3=$4;
   var $5=$1;
   var $6=$tmp155__3;
   var $7=_ATSLIB_056_libats_056_ML__array0_get_at_size__59__3($5, $6);
   $tmpret154__3=$7;
   var $8=$tmpret154__3;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__1($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp281__1;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$2;
   $tmp281__1=$5;
   var $6=$1;
   var $7=$tmp281__1;
   var $8=$3;
   _ATSLIB_056_libats_056_ML__array0_set_at_size__111__1($6, $7, $8);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_guint__109__2($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp281__2;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$2;
   $tmp281__2=$5;
   var $6=$1;
   var $7=$tmp281__2;
   var $8=$3;
   _ATSLIB_056_libats_056_ML__array0_set_at_size__111__2($6, $7, $8);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_size__111__2($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp285__2;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__6($5);
   $tmp285__2=$6;
   var $7=$tmp285__2;
   var $8=$2;
   var $9=$3;
   _ATSLIB_056_prelude__arrszref_set_at_size__114__2($7, $8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__6($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__6;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__6=$3;
   var $4=$tmpret162__6;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_set_at_size__114__2($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp290__2=sp;
   var $tmp291__2;
   var $tmp292__2;
   var $tmp293__2;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$tmp290__2;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__6($5, $6);
   $tmp291__2=$7;
   var $8=HEAP32[(($tmp290__2)>>2)];
   var $9=$2;
   var $10=_atspre_g0uint_gt_size($8, $9);
   $tmp292__2=$10;
   var $11=$tmp292__2;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $14=$tmp291__2;
   var $15=$2;
   var $16=$3;
   _ATSLIB_056_prelude__arrayref_set_at_guint__117__2($14, $15, $16);
   label = 5; break;
  case 4: 
   $tmp293__2=1216;
   var $18=$tmp293__2;
   var $19=$18;
   _atsruntime_raise($19);
   label = 5; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__6($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__6;
   var $tmp175__6;
   var $tmp176__6;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__6=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__6=$11;
   var $12=$tmp176__6;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__6;
   $tmpret174__6=$15;
   var $16=$tmpret174__6;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_set_at_guint__117__2($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=$3;
   _ATSLIB_056_prelude__array_set_at_guint__119__2($5, $6, $7);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_set_at_guint__119__2($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp305__2;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=_ATSLIB_056_prelude__ptr0_add_guint__72__5($5, $6);
   $tmp305__2=$7;
   var $8=$tmp305__2;
   var $9=$3;
   _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__2($8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__5($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__5;
   var $tmp187__5;
   var $tmp188__5;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__5=$4;
   var $5=$tmp188__5;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__5=$6;
   var $7=$1;
   var $8=$tmp187__5;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__5=$9;
   var $10=$tmpret186__5;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=$1;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_set_at_size__111__1($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp285__1;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__5($5);
   $tmp285__1=$6;
   var $7=$tmp285__1;
   var $8=$2;
   var $9=$3;
   _ATSLIB_056_prelude__arrszref_set_at_size__114__1($7, $8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__5($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__5;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__5=$3;
   var $4=$tmpret162__5;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_set_at_size__114__1($arg0, $arg1, $arg2) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp290__1=sp;
   var $tmp291__1;
   var $tmp292__1;
   var $tmp293__1;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$tmp290__1;
   var $7=_ATSLIB_056_prelude__arrszref_get_refsize__65__5($5, $6);
   $tmp291__1=$7;
   var $8=HEAP32[(($tmp290__1)>>2)];
   var $9=$2;
   var $10=_atspre_g0uint_gt_size($8, $9);
   $tmp292__1=$10;
   var $11=$tmp292__1;
   var $12=(($11)|(0))!=0;
   if ($12) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $14=$tmp291__1;
   var $15=$2;
   var $16=$3;
   _ATSLIB_056_prelude__arrayref_set_at_guint__117__1($14, $15, $16);
   label = 5; break;
  case 4: 
   $tmp293__1=1216;
   var $18=$tmp293__1;
   var $19=$18;
   _atsruntime_raise($19);
   label = 5; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__5($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__5;
   var $tmp175__5;
   var $tmp176__5;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__5=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__5=$11;
   var $12=$tmp176__5;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__5;
   $tmpret174__5=$15;
   var $16=$tmpret174__5;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_set_at_guint__117__1($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=$3;
   _ATSLIB_056_prelude__array_set_at_guint__119__1($5, $6, $7);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_set_at_guint__119__1($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp305__1;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   var $6=$2;
   var $7=_ATSLIB_056_prelude__ptr0_add_guint__72__4($5, $6);
   $tmp305__1=$7;
   var $8=$tmp305__1;
   var $9=$3;
   _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__1($8, $9);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__4($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__4;
   var $tmp187__4;
   var $tmp188__4;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__4=$4;
   var $5=$tmp188__4;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__4=$6;
   var $7=$1;
   var $8=$tmp187__4;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__4=$9;
   var $10=$tmpret186__4;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_set__122__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   var $5=$1;
   var $6=$5;
   HEAP32[(($6)>>2)]=$4;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__3($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__3;
   var $tmp159__3;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__4($4);
   $tmp159__3=$5;
   var $6=$tmp159__3;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__3($6, $7);
   $tmpret158__3=$8;
   var $9=$tmpret158__3;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__4($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__4;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__4=$3;
   var $4=$tmpret162__4;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__3($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__3;
   var $tmp165__3=sp;
   var $tmp166__3;
   var $tmp167__3;
   var $tmp168__3;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__3;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__4($4, $5);
   $tmp166__3=$6;
   var $7=HEAP32[(($tmp165__3)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__3=$9;
   var $10=$tmp167__3;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__3;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__3($13, $14);
   $tmpret164__3=$15;
   label = 5; break;
  case 4: 
   $tmp168__3=1216;
   var $17=$tmp168__3;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__3;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__4($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__4;
   var $tmp175__4;
   var $tmp176__4;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__4=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__4=$11;
   var $12=$tmp176__4;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__4;
   $tmpret174__4=$15;
   var $16=$tmpret174__4;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__3($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__3;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__3($4, $5);
   $tmpret180__3=$6;
   var $7=$tmpret180__3;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__3($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__3;
   var $tmp183__3;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__3($4, $5);
   $tmp183__3=$6;
   var $7=$tmp183__3;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__3($7);
   $tmpret182__3=$8;
   var $9=$tmpret182__3;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__3($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__3;
   var $tmp187__3;
   var $tmp188__3;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__3=$4;
   var $5=$tmp188__3;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__3=$6;
   var $7=$1;
   var $8=$tmp187__3;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__3=$9;
   var $10=$tmpret186__3;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__3($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__3;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__3=$5;
   var $6=$tmpret192__3;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__2;
   var $tmp159__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__3($4);
   $tmp159__2=$5;
   var $6=$tmp159__2;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__2($6, $7);
   $tmpret158__2=$8;
   var $9=$tmpret158__2;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__3($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__3;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__3=$3;
   var $4=$tmpret162__3;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__2($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__2;
   var $tmp165__2=sp;
   var $tmp166__2;
   var $tmp167__2;
   var $tmp168__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__2;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__3($4, $5);
   $tmp166__2=$6;
   var $7=HEAP32[(($tmp165__2)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__2=$9;
   var $10=$tmp167__2;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__2;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__2($13, $14);
   $tmpret164__2=$15;
   label = 5; break;
  case 4: 
   $tmp168__2=1216;
   var $17=$tmp168__2;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__2;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__3($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__3;
   var $tmp175__3;
   var $tmp176__3;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__3=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__3=$11;
   var $12=$tmp176__3;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__3;
   $tmpret174__3=$15;
   var $16=$tmpret174__3;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__2($4, $5);
   $tmpret180__2=$6;
   var $7=$tmpret180__2;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__2;
   var $tmp183__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__2($4, $5);
   $tmp183__2=$6;
   var $7=$tmp183__2;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__2($7);
   $tmpret182__2=$8;
   var $9=$tmpret182__2;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
// WARNING: content after a branch in a label, line: 7177
// WARNING: content after a branch in a label, line: 7179
function _ATSLIB_056_prelude__ptr0_add_guint__72__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__2;
   var $tmp187__2;
   var $tmp188__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__2=$4;
   var $5=$tmp188__2;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__2=$6;
   var $7=$1;
   var $8=$tmp187__2;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__2=$9;
   var $10=$tmpret186__2;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__2=$5;
   var $6=$tmpret192__2;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__2($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__2;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__2=$3;
   var $4=$tmpret162__2;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__2($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__2;
   var $tmp175__2;
   var $tmp176__2;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__2=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__2=$11;
   var $12=$tmp176__2;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__2;
   $tmpret174__2=$15;
   var $16=$tmpret174__2;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_ptr_alloc__82__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret222__1;
   var $tmp223__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=_atspre_g0uint_mul_size($3, 4);
   $tmp223__1=$4;
   var $5=$tmp223__1;
   var $6=_atsruntime_malloc_libc_exn($5);
   $tmpret222__1=$6;
   var $7=$tmpret222__1;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_copy__85__1($arg0, $arg1, $arg2) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $3;
   var $tmp227__1;
   var $tmp228__1;
   var $tmp229__1;
   var $tmp230__1;
   $1=$arg0;
   $2=$arg1;
   $3=$arg2;
   label = 2; break;
  case 2: 
   var $5=$1;
   $tmp227__1=$5;
   var $6=$2;
   $tmp228__1=$6;
   var $7=$3;
   var $8=_atspre_g0uint_mul_size($7, 4);
   $tmp230__1=$8;
   var $9=$tmp227__1;
   var $10=$tmp228__1;
   var $11=$tmp230__1;
   assert($11 % 1 === 0);(_memcpy($9, $10, $11)|0);
   $tmp229__1=$9;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_make_arrayref__87__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret236__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=_atsruntime_malloc_libc_exn(8);
   $tmpret236__1=$4;
   var $5=$1;
   var $6=$tmpret236__1;
   var $7=$6;
   var $8=(($7)|0);
   HEAP32[(($8)>>2)]=$5;
   var $9=$2;
   var $10=$tmpret236__1;
   var $11=$10;
   var $12=(($11+4)|0);
   HEAP32[(($12)>>2)]=$9;
   var $13=$tmpret236__1;
   return $13;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_of_arrszref__89__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret238__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret238__1=$3;
   var $4=$tmpret238__1;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__array0_get_at_size__59__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret158__1;
   var $tmp159__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=_ATSLIB_056_libats_056_ML__arrszref_of_array0__61__1($4);
   $tmp159__1=$5;
   var $6=$tmp159__1;
   var $7=$2;
   var $8=_ATSLIB_056_prelude__arrszref_get_at_size__63__1($6, $7);
   $tmpret158__1=$8;
   var $9=$tmpret158__1;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__arrszref_of_array0__61__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret162__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   $tmpret162__1=$3;
   var $4=$tmpret162__1;
   return $4;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_at_size__63__1($arg0, $arg1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret164__1;
   var $tmp165__1=sp;
   var $tmp166__1;
   var $tmp167__1;
   var $tmp168__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$tmp165__1;
   var $6=_ATSLIB_056_prelude__arrszref_get_refsize__65__1($4, $5);
   $tmp166__1=$6;
   var $7=HEAP32[(($tmp165__1)>>2)];
   var $8=$2;
   var $9=_atspre_g0uint_gt_size($7, $8);
   $tmp167__1=$9;
   var $10=$tmp167__1;
   var $11=(($10)|(0))!=0;
   if ($11) { label = 3; break; } else { label = 4; break; }
  case 3: 
   var $13=$tmp166__1;
   var $14=$2;
   var $15=_ATSLIB_056_prelude__arrayref_get_at_guint__68__1($13, $14);
   $tmpret164__1=$15;
   label = 5; break;
  case 4: 
   $tmp168__1=1216;
   var $17=$tmp168__1;
   var $18=$17;
   _atsruntime_raise($18);
   label = 5; break;
  case 5: 
   var $20=$tmpret164__1;
   STACKTOP = sp;
   return $20;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrszref_get_refsize__65__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret174__1;
   var $tmp175__1;
   var $tmp176__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$4;
   var $6=(($5)|0);
   var $7=HEAP32[(($6)>>2)];
   $tmp175__1=$7;
   var $8=$1;
   var $9=$8;
   var $10=(($9+4)|0);
   var $11=HEAP32[(($10)>>2)];
   $tmp176__1=$11;
   var $12=$tmp176__1;
   var $13=$2;
   var $14=$13;
   HEAP32[(($14)>>2)]=$12;
   var $15=$tmp175__1;
   $tmpret174__1=$15;
   var $16=$tmpret174__1;
   return $16;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__arrayref_get_at_guint__68__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret180__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__array_get_at_guint__70__1($4, $5);
   $tmpret180__1=$6;
   var $7=$tmpret180__1;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__array_get_at_guint__70__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret182__1;
   var $tmp183__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__ptr0_add_guint__72__1($4, $5);
   $tmp183__1=$6;
   var $7=$tmp183__1;
   var $8=_ATSLIB_056_prelude_056_unsafe__ptr0_get__75__1($7);
   $tmpret182__1=$8;
   var $9=$tmpret182__1;
   return $9;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__ptr0_add_guint__72__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret186__1;
   var $tmp187__1;
   var $tmp188__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$2;
   $tmp188__1=$4;
   var $5=$tmp188__1;
   var $6=_atspre_g0uint_mul_size($5, 4);
   $tmp187__1=$6;
   var $7=$1;
   var $8=$tmp187__1;
   var $9=_atspre_add_ptr_bsz($7, $8);
   $tmpret186__1=$9;
   var $10=$tmpret186__1;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude_056_unsafe__ptr0_get__75__1($arg0) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $tmpret192__1;
   $1=$arg0;
   label = 2; break;
  case 2: 
   var $3=$1;
   var $4=$3;
   var $5=HEAP32[(($4)>>2)];
   $tmpret192__1=$5;
   var $6=$tmpret192__1;
   return $6;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_libats_056_ML__list0_reverse_append__17__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret61__1;
   var $tmp62__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__list_reverse_append__19__1($4, $5);
   $tmp62__1=$6;
   var $7=$tmp62__1;
   $tmpret61__1=$7;
   var $8=$tmpret61__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__list_reverse_append__19__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret65__1;
   var $tmp66__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_ATSLIB_056_prelude__list_reverse_append2_vt__21__1($4, $5);
   $tmp66__1=$6;
   var $7=$tmp66__1;
   $tmpret65__1=$7;
   var $8=$tmpret65__1;
   return $8;
  default: assert(0, "bad label: " + label);
 }
}
function _ATSLIB_056_prelude__list_reverse_append2_vt__21__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $tmpret69__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   var $4=$1;
   var $5=$2;
   var $6=_loop_22__22__1($4, $5);
   $tmpret69__1=$6;
   var $7=$tmpret69__1;
   return $7;
  default: assert(0, "bad label: " + label);
 }
}
function _loop_22__22__1($arg0, $arg1) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1;
   var $2;
   var $argx0;
   var $argx1;
   var $tmpret70__1;
   var $tmp71__1;
   var $tmp72__1;
   var $tmp73__1;
   $1=$arg0;
   $2=$arg1;
   label = 2; break;
  case 2: 
   label = 3; break;
  case 3: 
   label = 4; break;
  case 4: 
   var $6=$1;
   var $7=0==(($6)|(0));
   if ($7) { label = 5; break; } else { label = 6; break; }
  case 5: 
   label = 9; break;
  case 6: 
   label = 7; break;
  case 7: 
   var $11=$1;
   var $12=$11;
   var $13=(($12)|0);
   var $14=HEAP32[(($13)>>2)];
   $tmp71__1=$14;
   var $15=$1;
   var $16=$15;
   var $17=(($16+4)|0);
   var $18=HEAP32[(($17)>>2)];
   $tmp72__1=$18;
   var $19=_atsruntime_malloc_libc_exn(8);
   $tmp73__1=$19;
   var $20=$tmp71__1;
   var $21=$tmp73__1;
   var $22=$21;
   var $23=(($22)|0);
   HEAP32[(($23)>>2)]=$20;
   var $24=$2;
   var $25=$tmp73__1;
   var $26=$25;
   var $27=(($26+4)|0);
   HEAP32[(($27)>>2)]=$24;
   label = 8; break;
  case 8: 
   var $29=$tmp72__1;
   $argx0=$29;
   var $30=$tmp73__1;
   $argx1=$30;
   var $31=$argx0;
   $1=$31;
   var $32=$argx1;
   $2=$32;
   label = 2; break;
  case 9: 
   var $36=$2;
   $tmpret70__1=$36;
   label = 10; break;
  case 10: 
   var $38=$tmpret70__1;
   return $38;
  default: assert(0, "bad label: " + label);
 }
}
function _malloc($bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($bytes)>>>(0)) < 245;
   if ($1) { label = 2; break; } else { label = 78; break; }
  case 2: 
   var $3=(($bytes)>>>(0)) < 11;
   if ($3) { var $8 = 16;label = 4; break; } else { label = 3; break; }
  case 3: 
   var $5=((($bytes)+(11))|0);
   var $6=$5 & -8;
   var $8 = $6;label = 4; break;
  case 4: 
   var $8;
   var $9=$8 >>> 3;
   var $10=HEAP32[((((1336)|0))>>2)];
   var $11=$10 >>> (($9)>>>(0));
   var $12=$11 & 3;
   var $13=(($12)|(0))==0;
   if ($13) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $15=$11 & 1;
   var $16=$15 ^ 1;
   var $17=((($16)+($9))|0);
   var $18=$17 << 1;
   var $19=((1376+($18<<2))|0);
   var $20=$19;
   var $_sum111=((($18)+(2))|0);
   var $21=((1376+($_sum111<<2))|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=(($22+8)|0);
   var $24=HEAP32[(($23)>>2)];
   var $25=(($20)|(0))==(($24)|(0));
   if ($25) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $27=1 << $17;
   var $28=$27 ^ -1;
   var $29=$10 & $28;
   HEAP32[((((1336)|0))>>2)]=$29;
   label = 11; break;
  case 7: 
   var $31=$24;
   var $32=HEAP32[((((1352)|0))>>2)];
   var $33=(($31)>>>(0)) < (($32)>>>(0));
   if ($33) { label = 10; break; } else { label = 8; break; }
  case 8: 
   var $35=(($24+12)|0);
   var $36=HEAP32[(($35)>>2)];
   var $37=(($36)|(0))==(($22)|(0));
   if ($37) { label = 9; break; } else { label = 10; break; }
  case 9: 
   HEAP32[(($35)>>2)]=$20;
   HEAP32[(($21)>>2)]=$24;
   label = 11; break;
  case 10: 
   _abort();
   throw "Reached an unreachable!";
  case 11: 
   var $40=$17 << 3;
   var $41=$40 | 3;
   var $42=(($22+4)|0);
   HEAP32[(($42)>>2)]=$41;
   var $43=$22;
   var $_sum113114=$40 | 4;
   var $44=(($43+$_sum113114)|0);
   var $45=$44;
   var $46=HEAP32[(($45)>>2)];
   var $47=$46 | 1;
   HEAP32[(($45)>>2)]=$47;
   var $48=$23;
   var $mem_0 = $48;label = 341; break;
  case 12: 
   var $50=HEAP32[((((1344)|0))>>2)];
   var $51=(($8)>>>(0)) > (($50)>>>(0));
   if ($51) { label = 13; break; } else { var $nb_0 = $8;label = 160; break; }
  case 13: 
   var $53=(($11)|(0))==0;
   if ($53) { label = 27; break; } else { label = 14; break; }
  case 14: 
   var $55=$11 << $9;
   var $56=2 << $9;
   var $57=(((-$56))|0);
   var $58=$56 | $57;
   var $59=$55 & $58;
   var $60=(((-$59))|0);
   var $61=$59 & $60;
   var $62=((($61)-(1))|0);
   var $63=$62 >>> 12;
   var $64=$63 & 16;
   var $65=$62 >>> (($64)>>>(0));
   var $66=$65 >>> 5;
   var $67=$66 & 8;
   var $68=$67 | $64;
   var $69=$65 >>> (($67)>>>(0));
   var $70=$69 >>> 2;
   var $71=$70 & 4;
   var $72=$68 | $71;
   var $73=$69 >>> (($71)>>>(0));
   var $74=$73 >>> 1;
   var $75=$74 & 2;
   var $76=$72 | $75;
   var $77=$73 >>> (($75)>>>(0));
   var $78=$77 >>> 1;
   var $79=$78 & 1;
   var $80=$76 | $79;
   var $81=$77 >>> (($79)>>>(0));
   var $82=((($80)+($81))|0);
   var $83=$82 << 1;
   var $84=((1376+($83<<2))|0);
   var $85=$84;
   var $_sum104=((($83)+(2))|0);
   var $86=((1376+($_sum104<<2))|0);
   var $87=HEAP32[(($86)>>2)];
   var $88=(($87+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($85)|(0))==(($89)|(0));
   if ($90) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $92=1 << $82;
   var $93=$92 ^ -1;
   var $94=$10 & $93;
   HEAP32[((((1336)|0))>>2)]=$94;
   label = 20; break;
  case 16: 
   var $96=$89;
   var $97=HEAP32[((((1352)|0))>>2)];
   var $98=(($96)>>>(0)) < (($97)>>>(0));
   if ($98) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $100=(($89+12)|0);
   var $101=HEAP32[(($100)>>2)];
   var $102=(($101)|(0))==(($87)|(0));
   if ($102) { label = 18; break; } else { label = 19; break; }
  case 18: 
   HEAP32[(($100)>>2)]=$85;
   HEAP32[(($86)>>2)]=$89;
   label = 20; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   var $105=$82 << 3;
   var $106=((($105)-($8))|0);
   var $107=$8 | 3;
   var $108=(($87+4)|0);
   HEAP32[(($108)>>2)]=$107;
   var $109=$87;
   var $110=(($109+$8)|0);
   var $111=$110;
   var $112=$106 | 1;
   var $_sum106107=$8 | 4;
   var $113=(($109+$_sum106107)|0);
   var $114=$113;
   HEAP32[(($114)>>2)]=$112;
   var $115=(($109+$105)|0);
   var $116=$115;
   HEAP32[(($116)>>2)]=$106;
   var $117=HEAP32[((((1344)|0))>>2)];
   var $118=(($117)|(0))==0;
   if ($118) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $120=HEAP32[((((1356)|0))>>2)];
   var $121=$117 >>> 3;
   var $122=$121 << 1;
   var $123=((1376+($122<<2))|0);
   var $124=$123;
   var $125=HEAP32[((((1336)|0))>>2)];
   var $126=1 << $121;
   var $127=$125 & $126;
   var $128=(($127)|(0))==0;
   if ($128) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $130=$125 | $126;
   HEAP32[((((1336)|0))>>2)]=$130;
   var $_sum109_pre=((($122)+(2))|0);
   var $_pre=((1376+($_sum109_pre<<2))|0);
   var $F4_0 = $124;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $_sum110=((($122)+(2))|0);
   var $132=((1376+($_sum110<<2))|0);
   var $133=HEAP32[(($132)>>2)];
   var $134=$133;
   var $135=HEAP32[((((1352)|0))>>2)];
   var $136=(($134)>>>(0)) < (($135)>>>(0));
   if ($136) { label = 24; break; } else { var $F4_0 = $133;var $_pre_phi = $132;label = 25; break; }
  case 24: 
   _abort();
   throw "Reached an unreachable!";
  case 25: 
   var $_pre_phi;
   var $F4_0;
   HEAP32[(($_pre_phi)>>2)]=$120;
   var $139=(($F4_0+12)|0);
   HEAP32[(($139)>>2)]=$120;
   var $140=(($120+8)|0);
   HEAP32[(($140)>>2)]=$F4_0;
   var $141=(($120+12)|0);
   HEAP32[(($141)>>2)]=$124;
   label = 26; break;
  case 26: 
   HEAP32[((((1344)|0))>>2)]=$106;
   HEAP32[((((1356)|0))>>2)]=$111;
   var $143=$88;
   var $mem_0 = $143;label = 341; break;
  case 27: 
   var $145=HEAP32[((((1340)|0))>>2)];
   var $146=(($145)|(0))==0;
   if ($146) { var $nb_0 = $8;label = 160; break; } else { label = 28; break; }
  case 28: 
   var $148=(((-$145))|0);
   var $149=$145 & $148;
   var $150=((($149)-(1))|0);
   var $151=$150 >>> 12;
   var $152=$151 & 16;
   var $153=$150 >>> (($152)>>>(0));
   var $154=$153 >>> 5;
   var $155=$154 & 8;
   var $156=$155 | $152;
   var $157=$153 >>> (($155)>>>(0));
   var $158=$157 >>> 2;
   var $159=$158 & 4;
   var $160=$156 | $159;
   var $161=$157 >>> (($159)>>>(0));
   var $162=$161 >>> 1;
   var $163=$162 & 2;
   var $164=$160 | $163;
   var $165=$161 >>> (($163)>>>(0));
   var $166=$165 >>> 1;
   var $167=$166 & 1;
   var $168=$164 | $167;
   var $169=$165 >>> (($167)>>>(0));
   var $170=((($168)+($169))|0);
   var $171=((1640+($170<<2))|0);
   var $172=HEAP32[(($171)>>2)];
   var $173=(($172+4)|0);
   var $174=HEAP32[(($173)>>2)];
   var $175=$174 & -8;
   var $176=((($175)-($8))|0);
   var $t_0_i = $172;var $v_0_i = $172;var $rsize_0_i = $176;label = 29; break;
  case 29: 
   var $rsize_0_i;
   var $v_0_i;
   var $t_0_i;
   var $178=(($t_0_i+16)|0);
   var $179=HEAP32[(($178)>>2)];
   var $180=(($179)|(0))==0;
   if ($180) { label = 30; break; } else { var $185 = $179;label = 31; break; }
  case 30: 
   var $182=(($t_0_i+20)|0);
   var $183=HEAP32[(($182)>>2)];
   var $184=(($183)|(0))==0;
   if ($184) { label = 32; break; } else { var $185 = $183;label = 31; break; }
  case 31: 
   var $185;
   var $186=(($185+4)|0);
   var $187=HEAP32[(($186)>>2)];
   var $188=$187 & -8;
   var $189=((($188)-($8))|0);
   var $190=(($189)>>>(0)) < (($rsize_0_i)>>>(0));
   var $_rsize_0_i=$190 ? $189 : $rsize_0_i;
   var $_v_0_i=$190 ? $185 : $v_0_i;
   var $t_0_i = $185;var $v_0_i = $_v_0_i;var $rsize_0_i = $_rsize_0_i;label = 29; break;
  case 32: 
   var $192=$v_0_i;
   var $193=HEAP32[((((1352)|0))>>2)];
   var $194=(($192)>>>(0)) < (($193)>>>(0));
   if ($194) { label = 76; break; } else { label = 33; break; }
  case 33: 
   var $196=(($192+$8)|0);
   var $197=$196;
   var $198=(($192)>>>(0)) < (($196)>>>(0));
   if ($198) { label = 34; break; } else { label = 76; break; }
  case 34: 
   var $200=(($v_0_i+24)|0);
   var $201=HEAP32[(($200)>>2)];
   var $202=(($v_0_i+12)|0);
   var $203=HEAP32[(($202)>>2)];
   var $204=(($203)|(0))==(($v_0_i)|(0));
   if ($204) { label = 40; break; } else { label = 35; break; }
  case 35: 
   var $206=(($v_0_i+8)|0);
   var $207=HEAP32[(($206)>>2)];
   var $208=$207;
   var $209=(($208)>>>(0)) < (($193)>>>(0));
   if ($209) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $211=(($207+12)|0);
   var $212=HEAP32[(($211)>>2)];
   var $213=(($212)|(0))==(($v_0_i)|(0));
   if ($213) { label = 37; break; } else { label = 39; break; }
  case 37: 
   var $215=(($203+8)|0);
   var $216=HEAP32[(($215)>>2)];
   var $217=(($216)|(0))==(($v_0_i)|(0));
   if ($217) { label = 38; break; } else { label = 39; break; }
  case 38: 
   HEAP32[(($211)>>2)]=$203;
   HEAP32[(($215)>>2)]=$207;
   var $R_1_i = $203;label = 47; break;
  case 39: 
   _abort();
   throw "Reached an unreachable!";
  case 40: 
   var $220=(($v_0_i+20)|0);
   var $221=HEAP32[(($220)>>2)];
   var $222=(($221)|(0))==0;
   if ($222) { label = 41; break; } else { var $R_0_i = $221;var $RP_0_i = $220;label = 42; break; }
  case 41: 
   var $224=(($v_0_i+16)|0);
   var $225=HEAP32[(($224)>>2)];
   var $226=(($225)|(0))==0;
   if ($226) { var $R_1_i = 0;label = 47; break; } else { var $R_0_i = $225;var $RP_0_i = $224;label = 42; break; }
  case 42: 
   var $RP_0_i;
   var $R_0_i;
   var $227=(($R_0_i+20)|0);
   var $228=HEAP32[(($227)>>2)];
   var $229=(($228)|(0))==0;
   if ($229) { label = 43; break; } else { var $R_0_i = $228;var $RP_0_i = $227;label = 42; break; }
  case 43: 
   var $231=(($R_0_i+16)|0);
   var $232=HEAP32[(($231)>>2)];
   var $233=(($232)|(0))==0;
   if ($233) { label = 44; break; } else { var $R_0_i = $232;var $RP_0_i = $231;label = 42; break; }
  case 44: 
   var $235=$RP_0_i;
   var $236=(($235)>>>(0)) < (($193)>>>(0));
   if ($236) { label = 46; break; } else { label = 45; break; }
  case 45: 
   HEAP32[(($RP_0_i)>>2)]=0;
   var $R_1_i = $R_0_i;label = 47; break;
  case 46: 
   _abort();
   throw "Reached an unreachable!";
  case 47: 
   var $R_1_i;
   var $240=(($201)|(0))==0;
   if ($240) { label = 67; break; } else { label = 48; break; }
  case 48: 
   var $242=(($v_0_i+28)|0);
   var $243=HEAP32[(($242)>>2)];
   var $244=((1640+($243<<2))|0);
   var $245=HEAP32[(($244)>>2)];
   var $246=(($v_0_i)|(0))==(($245)|(0));
   if ($246) { label = 49; break; } else { label = 51; break; }
  case 49: 
   HEAP32[(($244)>>2)]=$R_1_i;
   var $cond_i=(($R_1_i)|(0))==0;
   if ($cond_i) { label = 50; break; } else { label = 57; break; }
  case 50: 
   var $248=HEAP32[(($242)>>2)];
   var $249=1 << $248;
   var $250=$249 ^ -1;
   var $251=HEAP32[((((1340)|0))>>2)];
   var $252=$251 & $250;
   HEAP32[((((1340)|0))>>2)]=$252;
   label = 67; break;
  case 51: 
   var $254=$201;
   var $255=HEAP32[((((1352)|0))>>2)];
   var $256=(($254)>>>(0)) < (($255)>>>(0));
   if ($256) { label = 55; break; } else { label = 52; break; }
  case 52: 
   var $258=(($201+16)|0);
   var $259=HEAP32[(($258)>>2)];
   var $260=(($259)|(0))==(($v_0_i)|(0));
   if ($260) { label = 53; break; } else { label = 54; break; }
  case 53: 
   HEAP32[(($258)>>2)]=$R_1_i;
   label = 56; break;
  case 54: 
   var $263=(($201+20)|0);
   HEAP32[(($263)>>2)]=$R_1_i;
   label = 56; break;
  case 55: 
   _abort();
   throw "Reached an unreachable!";
  case 56: 
   var $266=(($R_1_i)|(0))==0;
   if ($266) { label = 67; break; } else { label = 57; break; }
  case 57: 
   var $268=$R_1_i;
   var $269=HEAP32[((((1352)|0))>>2)];
   var $270=(($268)>>>(0)) < (($269)>>>(0));
   if ($270) { label = 66; break; } else { label = 58; break; }
  case 58: 
   var $272=(($R_1_i+24)|0);
   HEAP32[(($272)>>2)]=$201;
   var $273=(($v_0_i+16)|0);
   var $274=HEAP32[(($273)>>2)];
   var $275=(($274)|(0))==0;
   if ($275) { label = 62; break; } else { label = 59; break; }
  case 59: 
   var $277=$274;
   var $278=HEAP32[((((1352)|0))>>2)];
   var $279=(($277)>>>(0)) < (($278)>>>(0));
   if ($279) { label = 61; break; } else { label = 60; break; }
  case 60: 
   var $281=(($R_1_i+16)|0);
   HEAP32[(($281)>>2)]=$274;
   var $282=(($274+24)|0);
   HEAP32[(($282)>>2)]=$R_1_i;
   label = 62; break;
  case 61: 
   _abort();
   throw "Reached an unreachable!";
  case 62: 
   var $285=(($v_0_i+20)|0);
   var $286=HEAP32[(($285)>>2)];
   var $287=(($286)|(0))==0;
   if ($287) { label = 67; break; } else { label = 63; break; }
  case 63: 
   var $289=$286;
   var $290=HEAP32[((((1352)|0))>>2)];
   var $291=(($289)>>>(0)) < (($290)>>>(0));
   if ($291) { label = 65; break; } else { label = 64; break; }
  case 64: 
   var $293=(($R_1_i+20)|0);
   HEAP32[(($293)>>2)]=$286;
   var $294=(($286+24)|0);
   HEAP32[(($294)>>2)]=$R_1_i;
   label = 67; break;
  case 65: 
   _abort();
   throw "Reached an unreachable!";
  case 66: 
   _abort();
   throw "Reached an unreachable!";
  case 67: 
   var $298=(($rsize_0_i)>>>(0)) < 16;
   if ($298) { label = 68; break; } else { label = 69; break; }
  case 68: 
   var $300=((($rsize_0_i)+($8))|0);
   var $301=$300 | 3;
   var $302=(($v_0_i+4)|0);
   HEAP32[(($302)>>2)]=$301;
   var $_sum4_i=((($300)+(4))|0);
   var $303=(($192+$_sum4_i)|0);
   var $304=$303;
   var $305=HEAP32[(($304)>>2)];
   var $306=$305 | 1;
   HEAP32[(($304)>>2)]=$306;
   label = 77; break;
  case 69: 
   var $308=$8 | 3;
   var $309=(($v_0_i+4)|0);
   HEAP32[(($309)>>2)]=$308;
   var $310=$rsize_0_i | 1;
   var $_sum_i137=$8 | 4;
   var $311=(($192+$_sum_i137)|0);
   var $312=$311;
   HEAP32[(($312)>>2)]=$310;
   var $_sum1_i=((($rsize_0_i)+($8))|0);
   var $313=(($192+$_sum1_i)|0);
   var $314=$313;
   HEAP32[(($314)>>2)]=$rsize_0_i;
   var $315=HEAP32[((((1344)|0))>>2)];
   var $316=(($315)|(0))==0;
   if ($316) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $318=HEAP32[((((1356)|0))>>2)];
   var $319=$315 >>> 3;
   var $320=$319 << 1;
   var $321=((1376+($320<<2))|0);
   var $322=$321;
   var $323=HEAP32[((((1336)|0))>>2)];
   var $324=1 << $319;
   var $325=$323 & $324;
   var $326=(($325)|(0))==0;
   if ($326) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $328=$323 | $324;
   HEAP32[((((1336)|0))>>2)]=$328;
   var $_sum2_pre_i=((($320)+(2))|0);
   var $_pre_i=((1376+($_sum2_pre_i<<2))|0);
   var $F1_0_i = $322;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $_sum3_i=((($320)+(2))|0);
   var $330=((1376+($_sum3_i<<2))|0);
   var $331=HEAP32[(($330)>>2)];
   var $332=$331;
   var $333=HEAP32[((((1352)|0))>>2)];
   var $334=(($332)>>>(0)) < (($333)>>>(0));
   if ($334) { label = 73; break; } else { var $F1_0_i = $331;var $_pre_phi_i = $330;label = 74; break; }
  case 73: 
   _abort();
   throw "Reached an unreachable!";
  case 74: 
   var $_pre_phi_i;
   var $F1_0_i;
   HEAP32[(($_pre_phi_i)>>2)]=$318;
   var $337=(($F1_0_i+12)|0);
   HEAP32[(($337)>>2)]=$318;
   var $338=(($318+8)|0);
   HEAP32[(($338)>>2)]=$F1_0_i;
   var $339=(($318+12)|0);
   HEAP32[(($339)>>2)]=$322;
   label = 75; break;
  case 75: 
   HEAP32[((((1344)|0))>>2)]=$rsize_0_i;
   HEAP32[((((1356)|0))>>2)]=$197;
   label = 77; break;
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $342=(($v_0_i+8)|0);
   var $343=$342;
   var $344=(($342)|(0))==0;
   if ($344) { var $nb_0 = $8;label = 160; break; } else { var $mem_0 = $343;label = 341; break; }
  case 78: 
   var $346=(($bytes)>>>(0)) > 4294967231;
   if ($346) { var $nb_0 = -1;label = 160; break; } else { label = 79; break; }
  case 79: 
   var $348=((($bytes)+(11))|0);
   var $349=$348 & -8;
   var $350=HEAP32[((((1340)|0))>>2)];
   var $351=(($350)|(0))==0;
   if ($351) { var $nb_0 = $349;label = 160; break; } else { label = 80; break; }
  case 80: 
   var $353=(((-$349))|0);
   var $354=$348 >>> 8;
   var $355=(($354)|(0))==0;
   if ($355) { var $idx_0_i = 0;label = 83; break; } else { label = 81; break; }
  case 81: 
   var $357=(($349)>>>(0)) > 16777215;
   if ($357) { var $idx_0_i = 31;label = 83; break; } else { label = 82; break; }
  case 82: 
   var $359=((($354)+(1048320))|0);
   var $360=$359 >>> 16;
   var $361=$360 & 8;
   var $362=$354 << $361;
   var $363=((($362)+(520192))|0);
   var $364=$363 >>> 16;
   var $365=$364 & 4;
   var $366=$365 | $361;
   var $367=$362 << $365;
   var $368=((($367)+(245760))|0);
   var $369=$368 >>> 16;
   var $370=$369 & 2;
   var $371=$366 | $370;
   var $372=(((14)-($371))|0);
   var $373=$367 << $370;
   var $374=$373 >>> 15;
   var $375=((($372)+($374))|0);
   var $376=$375 << 1;
   var $377=((($375)+(7))|0);
   var $378=$349 >>> (($377)>>>(0));
   var $379=$378 & 1;
   var $380=$379 | $376;
   var $idx_0_i = $380;label = 83; break;
  case 83: 
   var $idx_0_i;
   var $382=((1640+($idx_0_i<<2))|0);
   var $383=HEAP32[(($382)>>2)];
   var $384=(($383)|(0))==0;
   if ($384) { var $v_2_i = 0;var $rsize_2_i = $353;var $t_1_i = 0;label = 90; break; } else { label = 84; break; }
  case 84: 
   var $386=(($idx_0_i)|(0))==31;
   if ($386) { var $391 = 0;label = 86; break; } else { label = 85; break; }
  case 85: 
   var $388=$idx_0_i >>> 1;
   var $389=(((25)-($388))|0);
   var $391 = $389;label = 86; break;
  case 86: 
   var $391;
   var $392=$349 << $391;
   var $v_0_i118 = 0;var $rsize_0_i117 = $353;var $t_0_i116 = $383;var $sizebits_0_i = $392;var $rst_0_i = 0;label = 87; break;
  case 87: 
   var $rst_0_i;
   var $sizebits_0_i;
   var $t_0_i116;
   var $rsize_0_i117;
   var $v_0_i118;
   var $394=(($t_0_i116+4)|0);
   var $395=HEAP32[(($394)>>2)];
   var $396=$395 & -8;
   var $397=((($396)-($349))|0);
   var $398=(($397)>>>(0)) < (($rsize_0_i117)>>>(0));
   if ($398) { label = 88; break; } else { var $v_1_i = $v_0_i118;var $rsize_1_i = $rsize_0_i117;label = 89; break; }
  case 88: 
   var $400=(($396)|(0))==(($349)|(0));
   if ($400) { var $v_2_i = $t_0_i116;var $rsize_2_i = $397;var $t_1_i = $t_0_i116;label = 90; break; } else { var $v_1_i = $t_0_i116;var $rsize_1_i = $397;label = 89; break; }
  case 89: 
   var $rsize_1_i;
   var $v_1_i;
   var $402=(($t_0_i116+20)|0);
   var $403=HEAP32[(($402)>>2)];
   var $404=$sizebits_0_i >>> 31;
   var $405=(($t_0_i116+16+($404<<2))|0);
   var $406=HEAP32[(($405)>>2)];
   var $407=(($403)|(0))==0;
   var $408=(($403)|(0))==(($406)|(0));
   var $or_cond_i=$407 | $408;
   var $rst_1_i=$or_cond_i ? $rst_0_i : $403;
   var $409=(($406)|(0))==0;
   var $410=$sizebits_0_i << 1;
   if ($409) { var $v_2_i = $v_1_i;var $rsize_2_i = $rsize_1_i;var $t_1_i = $rst_1_i;label = 90; break; } else { var $v_0_i118 = $v_1_i;var $rsize_0_i117 = $rsize_1_i;var $t_0_i116 = $406;var $sizebits_0_i = $410;var $rst_0_i = $rst_1_i;label = 87; break; }
  case 90: 
   var $t_1_i;
   var $rsize_2_i;
   var $v_2_i;
   var $411=(($t_1_i)|(0))==0;
   var $412=(($v_2_i)|(0))==0;
   var $or_cond21_i=$411 & $412;
   if ($or_cond21_i) { label = 91; break; } else { var $t_2_ph_i = $t_1_i;label = 93; break; }
  case 91: 
   var $414=2 << $idx_0_i;
   var $415=(((-$414))|0);
   var $416=$414 | $415;
   var $417=$350 & $416;
   var $418=(($417)|(0))==0;
   if ($418) { var $nb_0 = $349;label = 160; break; } else { label = 92; break; }
  case 92: 
   var $420=(((-$417))|0);
   var $421=$417 & $420;
   var $422=((($421)-(1))|0);
   var $423=$422 >>> 12;
   var $424=$423 & 16;
   var $425=$422 >>> (($424)>>>(0));
   var $426=$425 >>> 5;
   var $427=$426 & 8;
   var $428=$427 | $424;
   var $429=$425 >>> (($427)>>>(0));
   var $430=$429 >>> 2;
   var $431=$430 & 4;
   var $432=$428 | $431;
   var $433=$429 >>> (($431)>>>(0));
   var $434=$433 >>> 1;
   var $435=$434 & 2;
   var $436=$432 | $435;
   var $437=$433 >>> (($435)>>>(0));
   var $438=$437 >>> 1;
   var $439=$438 & 1;
   var $440=$436 | $439;
   var $441=$437 >>> (($439)>>>(0));
   var $442=((($440)+($441))|0);
   var $443=((1640+($442<<2))|0);
   var $444=HEAP32[(($443)>>2)];
   var $t_2_ph_i = $444;label = 93; break;
  case 93: 
   var $t_2_ph_i;
   var $445=(($t_2_ph_i)|(0))==0;
   if ($445) { var $rsize_3_lcssa_i = $rsize_2_i;var $v_3_lcssa_i = $v_2_i;label = 96; break; } else { var $t_228_i = $t_2_ph_i;var $rsize_329_i = $rsize_2_i;var $v_330_i = $v_2_i;label = 94; break; }
  case 94: 
   var $v_330_i;
   var $rsize_329_i;
   var $t_228_i;
   var $446=(($t_228_i+4)|0);
   var $447=HEAP32[(($446)>>2)];
   var $448=$447 & -8;
   var $449=((($448)-($349))|0);
   var $450=(($449)>>>(0)) < (($rsize_329_i)>>>(0));
   var $_rsize_3_i=$450 ? $449 : $rsize_329_i;
   var $t_2_v_3_i=$450 ? $t_228_i : $v_330_i;
   var $451=(($t_228_i+16)|0);
   var $452=HEAP32[(($451)>>2)];
   var $453=(($452)|(0))==0;
   if ($453) { label = 95; break; } else { var $t_228_i = $452;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 95: 
   var $454=(($t_228_i+20)|0);
   var $455=HEAP32[(($454)>>2)];
   var $456=(($455)|(0))==0;
   if ($456) { var $rsize_3_lcssa_i = $_rsize_3_i;var $v_3_lcssa_i = $t_2_v_3_i;label = 96; break; } else { var $t_228_i = $455;var $rsize_329_i = $_rsize_3_i;var $v_330_i = $t_2_v_3_i;label = 94; break; }
  case 96: 
   var $v_3_lcssa_i;
   var $rsize_3_lcssa_i;
   var $457=(($v_3_lcssa_i)|(0))==0;
   if ($457) { var $nb_0 = $349;label = 160; break; } else { label = 97; break; }
  case 97: 
   var $459=HEAP32[((((1344)|0))>>2)];
   var $460=((($459)-($349))|0);
   var $461=(($rsize_3_lcssa_i)>>>(0)) < (($460)>>>(0));
   if ($461) { label = 98; break; } else { var $nb_0 = $349;label = 160; break; }
  case 98: 
   var $463=$v_3_lcssa_i;
   var $464=HEAP32[((((1352)|0))>>2)];
   var $465=(($463)>>>(0)) < (($464)>>>(0));
   if ($465) { label = 158; break; } else { label = 99; break; }
  case 99: 
   var $467=(($463+$349)|0);
   var $468=$467;
   var $469=(($463)>>>(0)) < (($467)>>>(0));
   if ($469) { label = 100; break; } else { label = 158; break; }
  case 100: 
   var $471=(($v_3_lcssa_i+24)|0);
   var $472=HEAP32[(($471)>>2)];
   var $473=(($v_3_lcssa_i+12)|0);
   var $474=HEAP32[(($473)>>2)];
   var $475=(($474)|(0))==(($v_3_lcssa_i)|(0));
   if ($475) { label = 106; break; } else { label = 101; break; }
  case 101: 
   var $477=(($v_3_lcssa_i+8)|0);
   var $478=HEAP32[(($477)>>2)];
   var $479=$478;
   var $480=(($479)>>>(0)) < (($464)>>>(0));
   if ($480) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $482=(($478+12)|0);
   var $483=HEAP32[(($482)>>2)];
   var $484=(($483)|(0))==(($v_3_lcssa_i)|(0));
   if ($484) { label = 103; break; } else { label = 105; break; }
  case 103: 
   var $486=(($474+8)|0);
   var $487=HEAP32[(($486)>>2)];
   var $488=(($487)|(0))==(($v_3_lcssa_i)|(0));
   if ($488) { label = 104; break; } else { label = 105; break; }
  case 104: 
   HEAP32[(($482)>>2)]=$474;
   HEAP32[(($486)>>2)]=$478;
   var $R_1_i122 = $474;label = 113; break;
  case 105: 
   _abort();
   throw "Reached an unreachable!";
  case 106: 
   var $491=(($v_3_lcssa_i+20)|0);
   var $492=HEAP32[(($491)>>2)];
   var $493=(($492)|(0))==0;
   if ($493) { label = 107; break; } else { var $R_0_i120 = $492;var $RP_0_i119 = $491;label = 108; break; }
  case 107: 
   var $495=(($v_3_lcssa_i+16)|0);
   var $496=HEAP32[(($495)>>2)];
   var $497=(($496)|(0))==0;
   if ($497) { var $R_1_i122 = 0;label = 113; break; } else { var $R_0_i120 = $496;var $RP_0_i119 = $495;label = 108; break; }
  case 108: 
   var $RP_0_i119;
   var $R_0_i120;
   var $498=(($R_0_i120+20)|0);
   var $499=HEAP32[(($498)>>2)];
   var $500=(($499)|(0))==0;
   if ($500) { label = 109; break; } else { var $R_0_i120 = $499;var $RP_0_i119 = $498;label = 108; break; }
  case 109: 
   var $502=(($R_0_i120+16)|0);
   var $503=HEAP32[(($502)>>2)];
   var $504=(($503)|(0))==0;
   if ($504) { label = 110; break; } else { var $R_0_i120 = $503;var $RP_0_i119 = $502;label = 108; break; }
  case 110: 
   var $506=$RP_0_i119;
   var $507=(($506)>>>(0)) < (($464)>>>(0));
   if ($507) { label = 112; break; } else { label = 111; break; }
  case 111: 
   HEAP32[(($RP_0_i119)>>2)]=0;
   var $R_1_i122 = $R_0_i120;label = 113; break;
  case 112: 
   _abort();
   throw "Reached an unreachable!";
  case 113: 
   var $R_1_i122;
   var $511=(($472)|(0))==0;
   if ($511) { label = 133; break; } else { label = 114; break; }
  case 114: 
   var $513=(($v_3_lcssa_i+28)|0);
   var $514=HEAP32[(($513)>>2)];
   var $515=((1640+($514<<2))|0);
   var $516=HEAP32[(($515)>>2)];
   var $517=(($v_3_lcssa_i)|(0))==(($516)|(0));
   if ($517) { label = 115; break; } else { label = 117; break; }
  case 115: 
   HEAP32[(($515)>>2)]=$R_1_i122;
   var $cond_i123=(($R_1_i122)|(0))==0;
   if ($cond_i123) { label = 116; break; } else { label = 123; break; }
  case 116: 
   var $519=HEAP32[(($513)>>2)];
   var $520=1 << $519;
   var $521=$520 ^ -1;
   var $522=HEAP32[((((1340)|0))>>2)];
   var $523=$522 & $521;
   HEAP32[((((1340)|0))>>2)]=$523;
   label = 133; break;
  case 117: 
   var $525=$472;
   var $526=HEAP32[((((1352)|0))>>2)];
   var $527=(($525)>>>(0)) < (($526)>>>(0));
   if ($527) { label = 121; break; } else { label = 118; break; }
  case 118: 
   var $529=(($472+16)|0);
   var $530=HEAP32[(($529)>>2)];
   var $531=(($530)|(0))==(($v_3_lcssa_i)|(0));
   if ($531) { label = 119; break; } else { label = 120; break; }
  case 119: 
   HEAP32[(($529)>>2)]=$R_1_i122;
   label = 122; break;
  case 120: 
   var $534=(($472+20)|0);
   HEAP32[(($534)>>2)]=$R_1_i122;
   label = 122; break;
  case 121: 
   _abort();
   throw "Reached an unreachable!";
  case 122: 
   var $537=(($R_1_i122)|(0))==0;
   if ($537) { label = 133; break; } else { label = 123; break; }
  case 123: 
   var $539=$R_1_i122;
   var $540=HEAP32[((((1352)|0))>>2)];
   var $541=(($539)>>>(0)) < (($540)>>>(0));
   if ($541) { label = 132; break; } else { label = 124; break; }
  case 124: 
   var $543=(($R_1_i122+24)|0);
   HEAP32[(($543)>>2)]=$472;
   var $544=(($v_3_lcssa_i+16)|0);
   var $545=HEAP32[(($544)>>2)];
   var $546=(($545)|(0))==0;
   if ($546) { label = 128; break; } else { label = 125; break; }
  case 125: 
   var $548=$545;
   var $549=HEAP32[((((1352)|0))>>2)];
   var $550=(($548)>>>(0)) < (($549)>>>(0));
   if ($550) { label = 127; break; } else { label = 126; break; }
  case 126: 
   var $552=(($R_1_i122+16)|0);
   HEAP32[(($552)>>2)]=$545;
   var $553=(($545+24)|0);
   HEAP32[(($553)>>2)]=$R_1_i122;
   label = 128; break;
  case 127: 
   _abort();
   throw "Reached an unreachable!";
  case 128: 
   var $556=(($v_3_lcssa_i+20)|0);
   var $557=HEAP32[(($556)>>2)];
   var $558=(($557)|(0))==0;
   if ($558) { label = 133; break; } else { label = 129; break; }
  case 129: 
   var $560=$557;
   var $561=HEAP32[((((1352)|0))>>2)];
   var $562=(($560)>>>(0)) < (($561)>>>(0));
   if ($562) { label = 131; break; } else { label = 130; break; }
  case 130: 
   var $564=(($R_1_i122+20)|0);
   HEAP32[(($564)>>2)]=$557;
   var $565=(($557+24)|0);
   HEAP32[(($565)>>2)]=$R_1_i122;
   label = 133; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   _abort();
   throw "Reached an unreachable!";
  case 133: 
   var $569=(($rsize_3_lcssa_i)>>>(0)) < 16;
   if ($569) { label = 134; break; } else { label = 135; break; }
  case 134: 
   var $571=((($rsize_3_lcssa_i)+($349))|0);
   var $572=$571 | 3;
   var $573=(($v_3_lcssa_i+4)|0);
   HEAP32[(($573)>>2)]=$572;
   var $_sum19_i=((($571)+(4))|0);
   var $574=(($463+$_sum19_i)|0);
   var $575=$574;
   var $576=HEAP32[(($575)>>2)];
   var $577=$576 | 1;
   HEAP32[(($575)>>2)]=$577;
   label = 159; break;
  case 135: 
   var $579=$349 | 3;
   var $580=(($v_3_lcssa_i+4)|0);
   HEAP32[(($580)>>2)]=$579;
   var $581=$rsize_3_lcssa_i | 1;
   var $_sum_i125136=$349 | 4;
   var $582=(($463+$_sum_i125136)|0);
   var $583=$582;
   HEAP32[(($583)>>2)]=$581;
   var $_sum1_i126=((($rsize_3_lcssa_i)+($349))|0);
   var $584=(($463+$_sum1_i126)|0);
   var $585=$584;
   HEAP32[(($585)>>2)]=$rsize_3_lcssa_i;
   var $586=$rsize_3_lcssa_i >>> 3;
   var $587=(($rsize_3_lcssa_i)>>>(0)) < 256;
   if ($587) { label = 136; break; } else { label = 141; break; }
  case 136: 
   var $589=$586 << 1;
   var $590=((1376+($589<<2))|0);
   var $591=$590;
   var $592=HEAP32[((((1336)|0))>>2)];
   var $593=1 << $586;
   var $594=$592 & $593;
   var $595=(($594)|(0))==0;
   if ($595) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $597=$592 | $593;
   HEAP32[((((1336)|0))>>2)]=$597;
   var $_sum15_pre_i=((($589)+(2))|0);
   var $_pre_i127=((1376+($_sum15_pre_i<<2))|0);
   var $F5_0_i = $591;var $_pre_phi_i128 = $_pre_i127;label = 140; break;
  case 138: 
   var $_sum18_i=((($589)+(2))|0);
   var $599=((1376+($_sum18_i<<2))|0);
   var $600=HEAP32[(($599)>>2)];
   var $601=$600;
   var $602=HEAP32[((((1352)|0))>>2)];
   var $603=(($601)>>>(0)) < (($602)>>>(0));
   if ($603) { label = 139; break; } else { var $F5_0_i = $600;var $_pre_phi_i128 = $599;label = 140; break; }
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   var $_pre_phi_i128;
   var $F5_0_i;
   HEAP32[(($_pre_phi_i128)>>2)]=$468;
   var $606=(($F5_0_i+12)|0);
   HEAP32[(($606)>>2)]=$468;
   var $_sum16_i=((($349)+(8))|0);
   var $607=(($463+$_sum16_i)|0);
   var $608=$607;
   HEAP32[(($608)>>2)]=$F5_0_i;
   var $_sum17_i=((($349)+(12))|0);
   var $609=(($463+$_sum17_i)|0);
   var $610=$609;
   HEAP32[(($610)>>2)]=$591;
   label = 159; break;
  case 141: 
   var $612=$467;
   var $613=$rsize_3_lcssa_i >>> 8;
   var $614=(($613)|(0))==0;
   if ($614) { var $I7_0_i = 0;label = 144; break; } else { label = 142; break; }
  case 142: 
   var $616=(($rsize_3_lcssa_i)>>>(0)) > 16777215;
   if ($616) { var $I7_0_i = 31;label = 144; break; } else { label = 143; break; }
  case 143: 
   var $618=((($613)+(1048320))|0);
   var $619=$618 >>> 16;
   var $620=$619 & 8;
   var $621=$613 << $620;
   var $622=((($621)+(520192))|0);
   var $623=$622 >>> 16;
   var $624=$623 & 4;
   var $625=$624 | $620;
   var $626=$621 << $624;
   var $627=((($626)+(245760))|0);
   var $628=$627 >>> 16;
   var $629=$628 & 2;
   var $630=$625 | $629;
   var $631=(((14)-($630))|0);
   var $632=$626 << $629;
   var $633=$632 >>> 15;
   var $634=((($631)+($633))|0);
   var $635=$634 << 1;
   var $636=((($634)+(7))|0);
   var $637=$rsize_3_lcssa_i >>> (($636)>>>(0));
   var $638=$637 & 1;
   var $639=$638 | $635;
   var $I7_0_i = $639;label = 144; break;
  case 144: 
   var $I7_0_i;
   var $641=((1640+($I7_0_i<<2))|0);
   var $_sum2_i=((($349)+(28))|0);
   var $642=(($463+$_sum2_i)|0);
   var $643=$642;
   HEAP32[(($643)>>2)]=$I7_0_i;
   var $_sum3_i129=((($349)+(16))|0);
   var $644=(($463+$_sum3_i129)|0);
   var $_sum4_i130=((($349)+(20))|0);
   var $645=(($463+$_sum4_i130)|0);
   var $646=$645;
   HEAP32[(($646)>>2)]=0;
   var $647=$644;
   HEAP32[(($647)>>2)]=0;
   var $648=HEAP32[((((1340)|0))>>2)];
   var $649=1 << $I7_0_i;
   var $650=$648 & $649;
   var $651=(($650)|(0))==0;
   if ($651) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $653=$648 | $649;
   HEAP32[((((1340)|0))>>2)]=$653;
   HEAP32[(($641)>>2)]=$612;
   var $654=$641;
   var $_sum5_i=((($349)+(24))|0);
   var $655=(($463+$_sum5_i)|0);
   var $656=$655;
   HEAP32[(($656)>>2)]=$654;
   var $_sum6_i=((($349)+(12))|0);
   var $657=(($463+$_sum6_i)|0);
   var $658=$657;
   HEAP32[(($658)>>2)]=$612;
   var $_sum7_i=((($349)+(8))|0);
   var $659=(($463+$_sum7_i)|0);
   var $660=$659;
   HEAP32[(($660)>>2)]=$612;
   label = 159; break;
  case 146: 
   var $662=HEAP32[(($641)>>2)];
   var $663=(($I7_0_i)|(0))==31;
   if ($663) { var $668 = 0;label = 148; break; } else { label = 147; break; }
  case 147: 
   var $665=$I7_0_i >>> 1;
   var $666=(((25)-($665))|0);
   var $668 = $666;label = 148; break;
  case 148: 
   var $668;
   var $669=$rsize_3_lcssa_i << $668;
   var $K12_0_i = $669;var $T_0_i = $662;label = 149; break;
  case 149: 
   var $T_0_i;
   var $K12_0_i;
   var $671=(($T_0_i+4)|0);
   var $672=HEAP32[(($671)>>2)];
   var $673=$672 & -8;
   var $674=(($673)|(0))==(($rsize_3_lcssa_i)|(0));
   if ($674) { label = 154; break; } else { label = 150; break; }
  case 150: 
   var $676=$K12_0_i >>> 31;
   var $677=(($T_0_i+16+($676<<2))|0);
   var $678=HEAP32[(($677)>>2)];
   var $679=(($678)|(0))==0;
   var $680=$K12_0_i << 1;
   if ($679) { label = 151; break; } else { var $K12_0_i = $680;var $T_0_i = $678;label = 149; break; }
  case 151: 
   var $682=$677;
   var $683=HEAP32[((((1352)|0))>>2)];
   var $684=(($682)>>>(0)) < (($683)>>>(0));
   if ($684) { label = 153; break; } else { label = 152; break; }
  case 152: 
   HEAP32[(($677)>>2)]=$612;
   var $_sum12_i=((($349)+(24))|0);
   var $686=(($463+$_sum12_i)|0);
   var $687=$686;
   HEAP32[(($687)>>2)]=$T_0_i;
   var $_sum13_i=((($349)+(12))|0);
   var $688=(($463+$_sum13_i)|0);
   var $689=$688;
   HEAP32[(($689)>>2)]=$612;
   var $_sum14_i=((($349)+(8))|0);
   var $690=(($463+$_sum14_i)|0);
   var $691=$690;
   HEAP32[(($691)>>2)]=$612;
   label = 159; break;
  case 153: 
   _abort();
   throw "Reached an unreachable!";
  case 154: 
   var $694=(($T_0_i+8)|0);
   var $695=HEAP32[(($694)>>2)];
   var $696=$T_0_i;
   var $697=HEAP32[((((1352)|0))>>2)];
   var $698=(($696)>>>(0)) < (($697)>>>(0));
   if ($698) { label = 157; break; } else { label = 155; break; }
  case 155: 
   var $700=$695;
   var $701=(($700)>>>(0)) < (($697)>>>(0));
   if ($701) { label = 157; break; } else { label = 156; break; }
  case 156: 
   var $703=(($695+12)|0);
   HEAP32[(($703)>>2)]=$612;
   HEAP32[(($694)>>2)]=$612;
   var $_sum9_i=((($349)+(8))|0);
   var $704=(($463+$_sum9_i)|0);
   var $705=$704;
   HEAP32[(($705)>>2)]=$695;
   var $_sum10_i=((($349)+(12))|0);
   var $706=(($463+$_sum10_i)|0);
   var $707=$706;
   HEAP32[(($707)>>2)]=$T_0_i;
   var $_sum11_i=((($349)+(24))|0);
   var $708=(($463+$_sum11_i)|0);
   var $709=$708;
   HEAP32[(($709)>>2)]=0;
   label = 159; break;
  case 157: 
   _abort();
   throw "Reached an unreachable!";
  case 158: 
   _abort();
   throw "Reached an unreachable!";
  case 159: 
   var $711=(($v_3_lcssa_i+8)|0);
   var $712=$711;
   var $713=(($711)|(0))==0;
   if ($713) { var $nb_0 = $349;label = 160; break; } else { var $mem_0 = $712;label = 341; break; }
  case 160: 
   var $nb_0;
   var $714=HEAP32[((((1344)|0))>>2)];
   var $715=(($nb_0)>>>(0)) > (($714)>>>(0));
   if ($715) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $717=((($714)-($nb_0))|0);
   var $718=HEAP32[((((1356)|0))>>2)];
   var $719=(($717)>>>(0)) > 15;
   if ($719) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $721=$718;
   var $722=(($721+$nb_0)|0);
   var $723=$722;
   HEAP32[((((1356)|0))>>2)]=$723;
   HEAP32[((((1344)|0))>>2)]=$717;
   var $724=$717 | 1;
   var $_sum102=((($nb_0)+(4))|0);
   var $725=(($721+$_sum102)|0);
   var $726=$725;
   HEAP32[(($726)>>2)]=$724;
   var $727=(($721+$714)|0);
   var $728=$727;
   HEAP32[(($728)>>2)]=$717;
   var $729=$nb_0 | 3;
   var $730=(($718+4)|0);
   HEAP32[(($730)>>2)]=$729;
   label = 164; break;
  case 163: 
   HEAP32[((((1344)|0))>>2)]=0;
   HEAP32[((((1356)|0))>>2)]=0;
   var $732=$714 | 3;
   var $733=(($718+4)|0);
   HEAP32[(($733)>>2)]=$732;
   var $734=$718;
   var $_sum101=((($714)+(4))|0);
   var $735=(($734+$_sum101)|0);
   var $736=$735;
   var $737=HEAP32[(($736)>>2)];
   var $738=$737 | 1;
   HEAP32[(($736)>>2)]=$738;
   label = 164; break;
  case 164: 
   var $740=(($718+8)|0);
   var $741=$740;
   var $mem_0 = $741;label = 341; break;
  case 165: 
   var $743=HEAP32[((((1348)|0))>>2)];
   var $744=(($nb_0)>>>(0)) < (($743)>>>(0));
   if ($744) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $746=((($743)-($nb_0))|0);
   HEAP32[((((1348)|0))>>2)]=$746;
   var $747=HEAP32[((((1360)|0))>>2)];
   var $748=$747;
   var $749=(($748+$nb_0)|0);
   var $750=$749;
   HEAP32[((((1360)|0))>>2)]=$750;
   var $751=$746 | 1;
   var $_sum=((($nb_0)+(4))|0);
   var $752=(($748+$_sum)|0);
   var $753=$752;
   HEAP32[(($753)>>2)]=$751;
   var $754=$nb_0 | 3;
   var $755=(($747+4)|0);
   HEAP32[(($755)>>2)]=$754;
   var $756=(($747+8)|0);
   var $757=$756;
   var $mem_0 = $757;label = 341; break;
  case 167: 
   var $759=HEAP32[((((1312)|0))>>2)];
   var $760=(($759)|(0))==0;
   if ($760) { label = 168; break; } else { label = 171; break; }
  case 168: 
   var $762=_sysconf(30);
   var $763=((($762)-(1))|0);
   var $764=$763 & $762;
   var $765=(($764)|(0))==0;
   if ($765) { label = 170; break; } else { label = 169; break; }
  case 169: 
   _abort();
   throw "Reached an unreachable!";
  case 170: 
   HEAP32[((((1320)|0))>>2)]=$762;
   HEAP32[((((1316)|0))>>2)]=$762;
   HEAP32[((((1324)|0))>>2)]=-1;
   HEAP32[((((1328)|0))>>2)]=-1;
   HEAP32[((((1332)|0))>>2)]=0;
   HEAP32[((((1780)|0))>>2)]=0;
   var $767=_time(0);
   var $768=$767 & -16;
   var $769=$768 ^ 1431655768;
   HEAP32[((((1312)|0))>>2)]=$769;
   label = 171; break;
  case 171: 
   var $771=((($nb_0)+(48))|0);
   var $772=HEAP32[((((1320)|0))>>2)];
   var $773=((($nb_0)+(47))|0);
   var $774=((($772)+($773))|0);
   var $775=(((-$772))|0);
   var $776=$774 & $775;
   var $777=(($776)>>>(0)) > (($nb_0)>>>(0));
   if ($777) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $779=HEAP32[((((1776)|0))>>2)];
   var $780=(($779)|(0))==0;
   if ($780) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $782=HEAP32[((((1768)|0))>>2)];
   var $783=((($782)+($776))|0);
   var $784=(($783)>>>(0)) <= (($782)>>>(0));
   var $785=(($783)>>>(0)) > (($779)>>>(0));
   var $or_cond1_i=$784 | $785;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $787=HEAP32[((((1780)|0))>>2)];
   var $788=$787 & 4;
   var $789=(($788)|(0))==0;
   if ($789) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $791=HEAP32[((((1360)|0))>>2)];
   var $792=(($791)|(0))==0;
   if ($792) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $794=$791;
   var $sp_0_i_i = ((1784)|0);label = 177; break;
  case 177: 
   var $sp_0_i_i;
   var $796=(($sp_0_i_i)|0);
   var $797=HEAP32[(($796)>>2)];
   var $798=(($797)>>>(0)) > (($794)>>>(0));
   if ($798) { label = 179; break; } else { label = 178; break; }
  case 178: 
   var $800=(($sp_0_i_i+4)|0);
   var $801=HEAP32[(($800)>>2)];
   var $802=(($797+$801)|0);
   var $803=(($802)>>>(0)) > (($794)>>>(0));
   if ($803) { label = 180; break; } else { label = 179; break; }
  case 179: 
   var $805=(($sp_0_i_i+8)|0);
   var $806=HEAP32[(($805)>>2)];
   var $807=(($806)|(0))==0;
   if ($807) { label = 181; break; } else { var $sp_0_i_i = $806;label = 177; break; }
  case 180: 
   var $808=(($sp_0_i_i)|(0))==0;
   if ($808) { label = 181; break; } else { label = 188; break; }
  case 181: 
   var $809=_sbrk(0);
   var $810=(($809)|(0))==-1;
   if ($810) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 182; break; }
  case 182: 
   var $812=$809;
   var $813=HEAP32[((((1316)|0))>>2)];
   var $814=((($813)-(1))|0);
   var $815=$814 & $812;
   var $816=(($815)|(0))==0;
   if ($816) { var $ssize_0_i = $776;label = 184; break; } else { label = 183; break; }
  case 183: 
   var $818=((($814)+($812))|0);
   var $819=(((-$813))|0);
   var $820=$818 & $819;
   var $821=((($776)-($812))|0);
   var $822=((($821)+($820))|0);
   var $ssize_0_i = $822;label = 184; break;
  case 184: 
   var $ssize_0_i;
   var $824=HEAP32[((((1768)|0))>>2)];
   var $825=((($824)+($ssize_0_i))|0);
   var $826=(($ssize_0_i)>>>(0)) > (($nb_0)>>>(0));
   var $827=(($ssize_0_i)>>>(0)) < 2147483647;
   var $or_cond_i131=$826 & $827;
   if ($or_cond_i131) { label = 185; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 185: 
   var $829=HEAP32[((((1776)|0))>>2)];
   var $830=(($829)|(0))==0;
   if ($830) { label = 187; break; } else { label = 186; break; }
  case 186: 
   var $832=(($825)>>>(0)) <= (($824)>>>(0));
   var $833=(($825)>>>(0)) > (($829)>>>(0));
   var $or_cond2_i=$832 | $833;
   if ($or_cond2_i) { var $tsize_0303639_i = 0;label = 197; break; } else { label = 187; break; }
  case 187: 
   var $835=_sbrk($ssize_0_i);
   var $836=(($835)|(0))==(($809)|(0));
   var $ssize_0__i=$836 ? $ssize_0_i : 0;
   var $__i=$836 ? $809 : -1;
   var $tbase_0_i = $__i;var $tsize_0_i = $ssize_0__i;var $br_0_i = $835;var $ssize_1_i = $ssize_0_i;label = 190; break;
  case 188: 
   var $838=HEAP32[((((1348)|0))>>2)];
   var $839=((($774)-($838))|0);
   var $840=$839 & $775;
   var $841=(($840)>>>(0)) < 2147483647;
   if ($841) { label = 189; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 189: 
   var $843=_sbrk($840);
   var $844=HEAP32[(($796)>>2)];
   var $845=HEAP32[(($800)>>2)];
   var $846=(($844+$845)|0);
   var $847=(($843)|(0))==(($846)|(0));
   var $_3_i=$847 ? $840 : 0;
   var $_4_i=$847 ? $843 : -1;
   var $tbase_0_i = $_4_i;var $tsize_0_i = $_3_i;var $br_0_i = $843;var $ssize_1_i = $840;label = 190; break;
  case 190: 
   var $ssize_1_i;
   var $br_0_i;
   var $tsize_0_i;
   var $tbase_0_i;
   var $849=(((-$ssize_1_i))|0);
   var $850=(($tbase_0_i)|(0))==-1;
   if ($850) { label = 191; break; } else { var $tsize_244_i = $tsize_0_i;var $tbase_245_i = $tbase_0_i;label = 201; break; }
  case 191: 
   var $852=(($br_0_i)|(0))!=-1;
   var $853=(($ssize_1_i)>>>(0)) < 2147483647;
   var $or_cond5_i=$852 & $853;
   var $854=(($ssize_1_i)>>>(0)) < (($771)>>>(0));
   var $or_cond6_i=$or_cond5_i & $854;
   if ($or_cond6_i) { label = 192; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 192: 
   var $856=HEAP32[((((1320)|0))>>2)];
   var $857=((($773)-($ssize_1_i))|0);
   var $858=((($857)+($856))|0);
   var $859=(((-$856))|0);
   var $860=$858 & $859;
   var $861=(($860)>>>(0)) < 2147483647;
   if ($861) { label = 193; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 193: 
   var $863=_sbrk($860);
   var $864=(($863)|(0))==-1;
   if ($864) { label = 195; break; } else { label = 194; break; }
  case 194: 
   var $866=((($860)+($ssize_1_i))|0);
   var $ssize_2_i = $866;label = 196; break;
  case 195: 
   var $868=_sbrk($849);
   var $tsize_0303639_i = $tsize_0_i;label = 197; break;
  case 196: 
   var $ssize_2_i;
   var $870=(($br_0_i)|(0))==-1;
   if ($870) { var $tsize_0303639_i = $tsize_0_i;label = 197; break; } else { var $tsize_244_i = $ssize_2_i;var $tbase_245_i = $br_0_i;label = 201; break; }
  case 197: 
   var $tsize_0303639_i;
   var $871=HEAP32[((((1780)|0))>>2)];
   var $872=$871 | 4;
   HEAP32[((((1780)|0))>>2)]=$872;
   var $tsize_1_i = $tsize_0303639_i;label = 198; break;
  case 198: 
   var $tsize_1_i;
   var $874=(($776)>>>(0)) < 2147483647;
   if ($874) { label = 199; break; } else { label = 340; break; }
  case 199: 
   var $876=_sbrk($776);
   var $877=_sbrk(0);
   var $notlhs_i=(($876)|(0))!=-1;
   var $notrhs_i=(($877)|(0))!=-1;
   var $or_cond8_not_i=$notrhs_i & $notlhs_i;
   var $878=(($876)>>>(0)) < (($877)>>>(0));
   var $or_cond9_i=$or_cond8_not_i & $878;
   if ($or_cond9_i) { label = 200; break; } else { label = 340; break; }
  case 200: 
   var $879=$877;
   var $880=$876;
   var $881=((($879)-($880))|0);
   var $882=((($nb_0)+(40))|0);
   var $883=(($881)>>>(0)) > (($882)>>>(0));
   var $_tsize_1_i=$883 ? $881 : $tsize_1_i;
   var $_tbase_1_i=$883 ? $876 : -1;
   var $884=(($_tbase_1_i)|(0))==-1;
   if ($884) { label = 340; break; } else { var $tsize_244_i = $_tsize_1_i;var $tbase_245_i = $_tbase_1_i;label = 201; break; }
  case 201: 
   var $tbase_245_i;
   var $tsize_244_i;
   var $885=HEAP32[((((1768)|0))>>2)];
   var $886=((($885)+($tsize_244_i))|0);
   HEAP32[((((1768)|0))>>2)]=$886;
   var $887=HEAP32[((((1772)|0))>>2)];
   var $888=(($886)>>>(0)) > (($887)>>>(0));
   if ($888) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((1772)|0))>>2)]=$886;
   label = 203; break;
  case 203: 
   var $890=HEAP32[((((1360)|0))>>2)];
   var $891=(($890)|(0))==0;
   if ($891) { label = 204; break; } else { var $sp_067_i = ((1784)|0);label = 211; break; }
  case 204: 
   var $893=HEAP32[((((1352)|0))>>2)];
   var $894=(($893)|(0))==0;
   var $895=(($tbase_245_i)>>>(0)) < (($893)>>>(0));
   var $or_cond10_i=$894 | $895;
   if ($or_cond10_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((1352)|0))>>2)]=$tbase_245_i;
   label = 206; break;
  case 206: 
   HEAP32[((((1784)|0))>>2)]=$tbase_245_i;
   HEAP32[((((1788)|0))>>2)]=$tsize_244_i;
   HEAP32[((((1796)|0))>>2)]=0;
   var $897=HEAP32[((((1312)|0))>>2)];
   HEAP32[((((1372)|0))>>2)]=$897;
   HEAP32[((((1368)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $899=$i_02_i_i << 1;
   var $900=((1376+($899<<2))|0);
   var $901=$900;
   var $_sum_i_i=((($899)+(3))|0);
   var $902=((1376+($_sum_i_i<<2))|0);
   HEAP32[(($902)>>2)]=$901;
   var $_sum1_i_i=((($899)+(2))|0);
   var $903=((1376+($_sum1_i_i<<2))|0);
   HEAP32[(($903)>>2)]=$901;
   var $904=((($i_02_i_i)+(1))|0);
   var $905=(($904)>>>(0)) < 32;
   if ($905) { var $i_02_i_i = $904;label = 207; break; } else { label = 208; break; }
  case 208: 
   var $906=((($tsize_244_i)-(40))|0);
   var $907=(($tbase_245_i+8)|0);
   var $908=$907;
   var $909=$908 & 7;
   var $910=(($909)|(0))==0;
   if ($910) { var $914 = 0;label = 210; break; } else { label = 209; break; }
  case 209: 
   var $912=(((-$908))|0);
   var $913=$912 & 7;
   var $914 = $913;label = 210; break;
  case 210: 
   var $914;
   var $915=(($tbase_245_i+$914)|0);
   var $916=$915;
   var $917=((($906)-($914))|0);
   HEAP32[((((1360)|0))>>2)]=$916;
   HEAP32[((((1348)|0))>>2)]=$917;
   var $918=$917 | 1;
   var $_sum_i14_i=((($914)+(4))|0);
   var $919=(($tbase_245_i+$_sum_i14_i)|0);
   var $920=$919;
   HEAP32[(($920)>>2)]=$918;
   var $_sum2_i_i=((($tsize_244_i)-(36))|0);
   var $921=(($tbase_245_i+$_sum2_i_i)|0);
   var $922=$921;
   HEAP32[(($922)>>2)]=40;
   var $923=HEAP32[((((1328)|0))>>2)];
   HEAP32[((((1364)|0))>>2)]=$923;
   label = 338; break;
  case 211: 
   var $sp_067_i;
   var $924=(($sp_067_i)|0);
   var $925=HEAP32[(($924)>>2)];
   var $926=(($sp_067_i+4)|0);
   var $927=HEAP32[(($926)>>2)];
   var $928=(($925+$927)|0);
   var $929=(($tbase_245_i)|(0))==(($928)|(0));
   if ($929) { label = 213; break; } else { label = 212; break; }
  case 212: 
   var $931=(($sp_067_i+8)|0);
   var $932=HEAP32[(($931)>>2)];
   var $933=(($932)|(0))==0;
   if ($933) { label = 218; break; } else { var $sp_067_i = $932;label = 211; break; }
  case 213: 
   var $934=(($sp_067_i+12)|0);
   var $935=HEAP32[(($934)>>2)];
   var $936=$935 & 8;
   var $937=(($936)|(0))==0;
   if ($937) { label = 214; break; } else { label = 218; break; }
  case 214: 
   var $939=$890;
   var $940=(($939)>>>(0)) >= (($925)>>>(0));
   var $941=(($939)>>>(0)) < (($tbase_245_i)>>>(0));
   var $or_cond47_i=$940 & $941;
   if ($or_cond47_i) { label = 215; break; } else { label = 218; break; }
  case 215: 
   var $943=((($927)+($tsize_244_i))|0);
   HEAP32[(($926)>>2)]=$943;
   var $944=HEAP32[((((1360)|0))>>2)];
   var $945=HEAP32[((((1348)|0))>>2)];
   var $946=((($945)+($tsize_244_i))|0);
   var $947=$944;
   var $948=(($944+8)|0);
   var $949=$948;
   var $950=$949 & 7;
   var $951=(($950)|(0))==0;
   if ($951) { var $955 = 0;label = 217; break; } else { label = 216; break; }
  case 216: 
   var $953=(((-$949))|0);
   var $954=$953 & 7;
   var $955 = $954;label = 217; break;
  case 217: 
   var $955;
   var $956=(($947+$955)|0);
   var $957=$956;
   var $958=((($946)-($955))|0);
   HEAP32[((((1360)|0))>>2)]=$957;
   HEAP32[((((1348)|0))>>2)]=$958;
   var $959=$958 | 1;
   var $_sum_i18_i=((($955)+(4))|0);
   var $960=(($947+$_sum_i18_i)|0);
   var $961=$960;
   HEAP32[(($961)>>2)]=$959;
   var $_sum2_i19_i=((($946)+(4))|0);
   var $962=(($947+$_sum2_i19_i)|0);
   var $963=$962;
   HEAP32[(($963)>>2)]=40;
   var $964=HEAP32[((((1328)|0))>>2)];
   HEAP32[((((1364)|0))>>2)]=$964;
   label = 338; break;
  case 218: 
   var $965=HEAP32[((((1352)|0))>>2)];
   var $966=(($tbase_245_i)>>>(0)) < (($965)>>>(0));
   if ($966) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((1352)|0))>>2)]=$tbase_245_i;
   label = 220; break;
  case 220: 
   var $968=(($tbase_245_i+$tsize_244_i)|0);
   var $sp_160_i = ((1784)|0);label = 221; break;
  case 221: 
   var $sp_160_i;
   var $970=(($sp_160_i)|0);
   var $971=HEAP32[(($970)>>2)];
   var $972=(($971)|(0))==(($968)|(0));
   if ($972) { label = 223; break; } else { label = 222; break; }
  case 222: 
   var $974=(($sp_160_i+8)|0);
   var $975=HEAP32[(($974)>>2)];
   var $976=(($975)|(0))==0;
   if ($976) { label = 304; break; } else { var $sp_160_i = $975;label = 221; break; }
  case 223: 
   var $977=(($sp_160_i+12)|0);
   var $978=HEAP32[(($977)>>2)];
   var $979=$978 & 8;
   var $980=(($979)|(0))==0;
   if ($980) { label = 224; break; } else { label = 304; break; }
  case 224: 
   HEAP32[(($970)>>2)]=$tbase_245_i;
   var $982=(($sp_160_i+4)|0);
   var $983=HEAP32[(($982)>>2)];
   var $984=((($983)+($tsize_244_i))|0);
   HEAP32[(($982)>>2)]=$984;
   var $985=(($tbase_245_i+8)|0);
   var $986=$985;
   var $987=$986 & 7;
   var $988=(($987)|(0))==0;
   if ($988) { var $993 = 0;label = 226; break; } else { label = 225; break; }
  case 225: 
   var $990=(((-$986))|0);
   var $991=$990 & 7;
   var $993 = $991;label = 226; break;
  case 226: 
   var $993;
   var $994=(($tbase_245_i+$993)|0);
   var $_sum93_i=((($tsize_244_i)+(8))|0);
   var $995=(($tbase_245_i+$_sum93_i)|0);
   var $996=$995;
   var $997=$996 & 7;
   var $998=(($997)|(0))==0;
   if ($998) { var $1003 = 0;label = 228; break; } else { label = 227; break; }
  case 227: 
   var $1000=(((-$996))|0);
   var $1001=$1000 & 7;
   var $1003 = $1001;label = 228; break;
  case 228: 
   var $1003;
   var $_sum94_i=((($1003)+($tsize_244_i))|0);
   var $1004=(($tbase_245_i+$_sum94_i)|0);
   var $1005=$1004;
   var $1006=$1004;
   var $1007=$994;
   var $1008=((($1006)-($1007))|0);
   var $_sum_i21_i=((($993)+($nb_0))|0);
   var $1009=(($tbase_245_i+$_sum_i21_i)|0);
   var $1010=$1009;
   var $1011=((($1008)-($nb_0))|0);
   var $1012=$nb_0 | 3;
   var $_sum1_i22_i=((($993)+(4))|0);
   var $1013=(($tbase_245_i+$_sum1_i22_i)|0);
   var $1014=$1013;
   HEAP32[(($1014)>>2)]=$1012;
   var $1015=HEAP32[((((1360)|0))>>2)];
   var $1016=(($1005)|(0))==(($1015)|(0));
   if ($1016) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $1018=HEAP32[((((1348)|0))>>2)];
   var $1019=((($1018)+($1011))|0);
   HEAP32[((((1348)|0))>>2)]=$1019;
   HEAP32[((((1360)|0))>>2)]=$1010;
   var $1020=$1019 | 1;
   var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
   var $1021=(($tbase_245_i+$_sum46_i_i)|0);
   var $1022=$1021;
   HEAP32[(($1022)>>2)]=$1020;
   label = 303; break;
  case 230: 
   var $1024=HEAP32[((((1356)|0))>>2)];
   var $1025=(($1005)|(0))==(($1024)|(0));
   if ($1025) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $1027=HEAP32[((((1344)|0))>>2)];
   var $1028=((($1027)+($1011))|0);
   HEAP32[((((1344)|0))>>2)]=$1028;
   HEAP32[((((1356)|0))>>2)]=$1010;
   var $1029=$1028 | 1;
   var $_sum44_i_i=((($_sum_i21_i)+(4))|0);
   var $1030=(($tbase_245_i+$_sum44_i_i)|0);
   var $1031=$1030;
   HEAP32[(($1031)>>2)]=$1029;
   var $_sum45_i_i=((($1028)+($_sum_i21_i))|0);
   var $1032=(($tbase_245_i+$_sum45_i_i)|0);
   var $1033=$1032;
   HEAP32[(($1033)>>2)]=$1028;
   label = 303; break;
  case 232: 
   var $_sum2_i23_i=((($tsize_244_i)+(4))|0);
   var $_sum95_i=((($_sum2_i23_i)+($1003))|0);
   var $1035=(($tbase_245_i+$_sum95_i)|0);
   var $1036=$1035;
   var $1037=HEAP32[(($1036)>>2)];
   var $1038=$1037 & 3;
   var $1039=(($1038)|(0))==1;
   if ($1039) { label = 233; break; } else { var $oldfirst_0_i_i = $1005;var $qsize_0_i_i = $1011;label = 280; break; }
  case 233: 
   var $1041=$1037 & -8;
   var $1042=$1037 >>> 3;
   var $1043=(($1037)>>>(0)) < 256;
   if ($1043) { label = 234; break; } else { label = 246; break; }
  case 234: 
   var $_sum3940_i_i=$1003 | 8;
   var $_sum105_i=((($_sum3940_i_i)+($tsize_244_i))|0);
   var $1045=(($tbase_245_i+$_sum105_i)|0);
   var $1046=$1045;
   var $1047=HEAP32[(($1046)>>2)];
   var $_sum41_i_i=((($tsize_244_i)+(12))|0);
   var $_sum106_i=((($_sum41_i_i)+($1003))|0);
   var $1048=(($tbase_245_i+$_sum106_i)|0);
   var $1049=$1048;
   var $1050=HEAP32[(($1049)>>2)];
   var $1051=$1042 << 1;
   var $1052=((1376+($1051<<2))|0);
   var $1053=$1052;
   var $1054=(($1047)|(0))==(($1053)|(0));
   if ($1054) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $1056=$1047;
   var $1057=HEAP32[((((1352)|0))>>2)];
   var $1058=(($1056)>>>(0)) < (($1057)>>>(0));
   if ($1058) { label = 245; break; } else { label = 236; break; }
  case 236: 
   var $1060=(($1047+12)|0);
   var $1061=HEAP32[(($1060)>>2)];
   var $1062=(($1061)|(0))==(($1005)|(0));
   if ($1062) { label = 237; break; } else { label = 245; break; }
  case 237: 
   var $1063=(($1050)|(0))==(($1047)|(0));
   if ($1063) { label = 238; break; } else { label = 239; break; }
  case 238: 
   var $1065=1 << $1042;
   var $1066=$1065 ^ -1;
   var $1067=HEAP32[((((1336)|0))>>2)];
   var $1068=$1067 & $1066;
   HEAP32[((((1336)|0))>>2)]=$1068;
   label = 279; break;
  case 239: 
   var $1070=(($1050)|(0))==(($1053)|(0));
   if ($1070) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $_pre56_i_i=(($1050+8)|0);
   var $_pre_phi57_i_i = $_pre56_i_i;label = 243; break;
  case 241: 
   var $1072=$1050;
   var $1073=HEAP32[((((1352)|0))>>2)];
   var $1074=(($1072)>>>(0)) < (($1073)>>>(0));
   if ($1074) { label = 244; break; } else { label = 242; break; }
  case 242: 
   var $1076=(($1050+8)|0);
   var $1077=HEAP32[(($1076)>>2)];
   var $1078=(($1077)|(0))==(($1005)|(0));
   if ($1078) { var $_pre_phi57_i_i = $1076;label = 243; break; } else { label = 244; break; }
  case 243: 
   var $_pre_phi57_i_i;
   var $1079=(($1047+12)|0);
   HEAP32[(($1079)>>2)]=$1050;
   HEAP32[(($_pre_phi57_i_i)>>2)]=$1047;
   label = 279; break;
  case 244: 
   _abort();
   throw "Reached an unreachable!";
  case 245: 
   _abort();
   throw "Reached an unreachable!";
  case 246: 
   var $1081=$1004;
   var $_sum34_i_i=$1003 | 24;
   var $_sum96_i=((($_sum34_i_i)+($tsize_244_i))|0);
   var $1082=(($tbase_245_i+$_sum96_i)|0);
   var $1083=$1082;
   var $1084=HEAP32[(($1083)>>2)];
   var $_sum5_i_i=((($tsize_244_i)+(12))|0);
   var $_sum97_i=((($_sum5_i_i)+($1003))|0);
   var $1085=(($tbase_245_i+$_sum97_i)|0);
   var $1086=$1085;
   var $1087=HEAP32[(($1086)>>2)];
   var $1088=(($1087)|(0))==(($1081)|(0));
   if ($1088) { label = 252; break; } else { label = 247; break; }
  case 247: 
   var $_sum3637_i_i=$1003 | 8;
   var $_sum98_i=((($_sum3637_i_i)+($tsize_244_i))|0);
   var $1090=(($tbase_245_i+$_sum98_i)|0);
   var $1091=$1090;
   var $1092=HEAP32[(($1091)>>2)];
   var $1093=$1092;
   var $1094=HEAP32[((((1352)|0))>>2)];
   var $1095=(($1093)>>>(0)) < (($1094)>>>(0));
   if ($1095) { label = 251; break; } else { label = 248; break; }
  case 248: 
   var $1097=(($1092+12)|0);
   var $1098=HEAP32[(($1097)>>2)];
   var $1099=(($1098)|(0))==(($1081)|(0));
   if ($1099) { label = 249; break; } else { label = 251; break; }
  case 249: 
   var $1101=(($1087+8)|0);
   var $1102=HEAP32[(($1101)>>2)];
   var $1103=(($1102)|(0))==(($1081)|(0));
   if ($1103) { label = 250; break; } else { label = 251; break; }
  case 250: 
   HEAP32[(($1097)>>2)]=$1087;
   HEAP32[(($1101)>>2)]=$1092;
   var $R_1_i_i = $1087;label = 259; break;
  case 251: 
   _abort();
   throw "Reached an unreachable!";
  case 252: 
   var $_sum67_i_i=$1003 | 16;
   var $_sum103_i=((($_sum2_i23_i)+($_sum67_i_i))|0);
   var $1106=(($tbase_245_i+$_sum103_i)|0);
   var $1107=$1106;
   var $1108=HEAP32[(($1107)>>2)];
   var $1109=(($1108)|(0))==0;
   if ($1109) { label = 253; break; } else { var $R_0_i_i = $1108;var $RP_0_i_i = $1107;label = 254; break; }
  case 253: 
   var $_sum104_i=((($_sum67_i_i)+($tsize_244_i))|0);
   var $1111=(($tbase_245_i+$_sum104_i)|0);
   var $1112=$1111;
   var $1113=HEAP32[(($1112)>>2)];
   var $1114=(($1113)|(0))==0;
   if ($1114) { var $R_1_i_i = 0;label = 259; break; } else { var $R_0_i_i = $1113;var $RP_0_i_i = $1112;label = 254; break; }
  case 254: 
   var $RP_0_i_i;
   var $R_0_i_i;
   var $1115=(($R_0_i_i+20)|0);
   var $1116=HEAP32[(($1115)>>2)];
   var $1117=(($1116)|(0))==0;
   if ($1117) { label = 255; break; } else { var $R_0_i_i = $1116;var $RP_0_i_i = $1115;label = 254; break; }
  case 255: 
   var $1119=(($R_0_i_i+16)|0);
   var $1120=HEAP32[(($1119)>>2)];
   var $1121=(($1120)|(0))==0;
   if ($1121) { label = 256; break; } else { var $R_0_i_i = $1120;var $RP_0_i_i = $1119;label = 254; break; }
  case 256: 
   var $1123=$RP_0_i_i;
   var $1124=HEAP32[((((1352)|0))>>2)];
   var $1125=(($1123)>>>(0)) < (($1124)>>>(0));
   if ($1125) { label = 258; break; } else { label = 257; break; }
  case 257: 
   HEAP32[(($RP_0_i_i)>>2)]=0;
   var $R_1_i_i = $R_0_i_i;label = 259; break;
  case 258: 
   _abort();
   throw "Reached an unreachable!";
  case 259: 
   var $R_1_i_i;
   var $1129=(($1084)|(0))==0;
   if ($1129) { label = 279; break; } else { label = 260; break; }
  case 260: 
   var $_sum31_i_i=((($tsize_244_i)+(28))|0);
   var $_sum99_i=((($_sum31_i_i)+($1003))|0);
   var $1131=(($tbase_245_i+$_sum99_i)|0);
   var $1132=$1131;
   var $1133=HEAP32[(($1132)>>2)];
   var $1134=((1640+($1133<<2))|0);
   var $1135=HEAP32[(($1134)>>2)];
   var $1136=(($1081)|(0))==(($1135)|(0));
   if ($1136) { label = 261; break; } else { label = 263; break; }
  case 261: 
   HEAP32[(($1134)>>2)]=$R_1_i_i;
   var $cond_i_i=(($R_1_i_i)|(0))==0;
   if ($cond_i_i) { label = 262; break; } else { label = 269; break; }
  case 262: 
   var $1138=HEAP32[(($1132)>>2)];
   var $1139=1 << $1138;
   var $1140=$1139 ^ -1;
   var $1141=HEAP32[((((1340)|0))>>2)];
   var $1142=$1141 & $1140;
   HEAP32[((((1340)|0))>>2)]=$1142;
   label = 279; break;
  case 263: 
   var $1144=$1084;
   var $1145=HEAP32[((((1352)|0))>>2)];
   var $1146=(($1144)>>>(0)) < (($1145)>>>(0));
   if ($1146) { label = 267; break; } else { label = 264; break; }
  case 264: 
   var $1148=(($1084+16)|0);
   var $1149=HEAP32[(($1148)>>2)];
   var $1150=(($1149)|(0))==(($1081)|(0));
   if ($1150) { label = 265; break; } else { label = 266; break; }
  case 265: 
   HEAP32[(($1148)>>2)]=$R_1_i_i;
   label = 268; break;
  case 266: 
   var $1153=(($1084+20)|0);
   HEAP32[(($1153)>>2)]=$R_1_i_i;
   label = 268; break;
  case 267: 
   _abort();
   throw "Reached an unreachable!";
  case 268: 
   var $1156=(($R_1_i_i)|(0))==0;
   if ($1156) { label = 279; break; } else { label = 269; break; }
  case 269: 
   var $1158=$R_1_i_i;
   var $1159=HEAP32[((((1352)|0))>>2)];
   var $1160=(($1158)>>>(0)) < (($1159)>>>(0));
   if ($1160) { label = 278; break; } else { label = 270; break; }
  case 270: 
   var $1162=(($R_1_i_i+24)|0);
   HEAP32[(($1162)>>2)]=$1084;
   var $_sum3233_i_i=$1003 | 16;
   var $_sum100_i=((($_sum3233_i_i)+($tsize_244_i))|0);
   var $1163=(($tbase_245_i+$_sum100_i)|0);
   var $1164=$1163;
   var $1165=HEAP32[(($1164)>>2)];
   var $1166=(($1165)|(0))==0;
   if ($1166) { label = 274; break; } else { label = 271; break; }
  case 271: 
   var $1168=$1165;
   var $1169=HEAP32[((((1352)|0))>>2)];
   var $1170=(($1168)>>>(0)) < (($1169)>>>(0));
   if ($1170) { label = 273; break; } else { label = 272; break; }
  case 272: 
   var $1172=(($R_1_i_i+16)|0);
   HEAP32[(($1172)>>2)]=$1165;
   var $1173=(($1165+24)|0);
   HEAP32[(($1173)>>2)]=$R_1_i_i;
   label = 274; break;
  case 273: 
   _abort();
   throw "Reached an unreachable!";
  case 274: 
   var $_sum101_i=((($_sum2_i23_i)+($_sum3233_i_i))|0);
   var $1176=(($tbase_245_i+$_sum101_i)|0);
   var $1177=$1176;
   var $1178=HEAP32[(($1177)>>2)];
   var $1179=(($1178)|(0))==0;
   if ($1179) { label = 279; break; } else { label = 275; break; }
  case 275: 
   var $1181=$1178;
   var $1182=HEAP32[((((1352)|0))>>2)];
   var $1183=(($1181)>>>(0)) < (($1182)>>>(0));
   if ($1183) { label = 277; break; } else { label = 276; break; }
  case 276: 
   var $1185=(($R_1_i_i+20)|0);
   HEAP32[(($1185)>>2)]=$1178;
   var $1186=(($1178+24)|0);
   HEAP32[(($1186)>>2)]=$R_1_i_i;
   label = 279; break;
  case 277: 
   _abort();
   throw "Reached an unreachable!";
  case 278: 
   _abort();
   throw "Reached an unreachable!";
  case 279: 
   var $_sum9_i_i=$1041 | $1003;
   var $_sum102_i=((($_sum9_i_i)+($tsize_244_i))|0);
   var $1190=(($tbase_245_i+$_sum102_i)|0);
   var $1191=$1190;
   var $1192=((($1041)+($1011))|0);
   var $oldfirst_0_i_i = $1191;var $qsize_0_i_i = $1192;label = 280; break;
  case 280: 
   var $qsize_0_i_i;
   var $oldfirst_0_i_i;
   var $1194=(($oldfirst_0_i_i+4)|0);
   var $1195=HEAP32[(($1194)>>2)];
   var $1196=$1195 & -2;
   HEAP32[(($1194)>>2)]=$1196;
   var $1197=$qsize_0_i_i | 1;
   var $_sum10_i_i=((($_sum_i21_i)+(4))|0);
   var $1198=(($tbase_245_i+$_sum10_i_i)|0);
   var $1199=$1198;
   HEAP32[(($1199)>>2)]=$1197;
   var $_sum11_i_i=((($qsize_0_i_i)+($_sum_i21_i))|0);
   var $1200=(($tbase_245_i+$_sum11_i_i)|0);
   var $1201=$1200;
   HEAP32[(($1201)>>2)]=$qsize_0_i_i;
   var $1202=$qsize_0_i_i >>> 3;
   var $1203=(($qsize_0_i_i)>>>(0)) < 256;
   if ($1203) { label = 281; break; } else { label = 286; break; }
  case 281: 
   var $1205=$1202 << 1;
   var $1206=((1376+($1205<<2))|0);
   var $1207=$1206;
   var $1208=HEAP32[((((1336)|0))>>2)];
   var $1209=1 << $1202;
   var $1210=$1208 & $1209;
   var $1211=(($1210)|(0))==0;
   if ($1211) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $1213=$1208 | $1209;
   HEAP32[((((1336)|0))>>2)]=$1213;
   var $_sum27_pre_i_i=((($1205)+(2))|0);
   var $_pre_i24_i=((1376+($_sum27_pre_i_i<<2))|0);
   var $F4_0_i_i = $1207;var $_pre_phi_i25_i = $_pre_i24_i;label = 285; break;
  case 283: 
   var $_sum30_i_i=((($1205)+(2))|0);
   var $1215=((1376+($_sum30_i_i<<2))|0);
   var $1216=HEAP32[(($1215)>>2)];
   var $1217=$1216;
   var $1218=HEAP32[((((1352)|0))>>2)];
   var $1219=(($1217)>>>(0)) < (($1218)>>>(0));
   if ($1219) { label = 284; break; } else { var $F4_0_i_i = $1216;var $_pre_phi_i25_i = $1215;label = 285; break; }
  case 284: 
   _abort();
   throw "Reached an unreachable!";
  case 285: 
   var $_pre_phi_i25_i;
   var $F4_0_i_i;
   HEAP32[(($_pre_phi_i25_i)>>2)]=$1010;
   var $1222=(($F4_0_i_i+12)|0);
   HEAP32[(($1222)>>2)]=$1010;
   var $_sum28_i_i=((($_sum_i21_i)+(8))|0);
   var $1223=(($tbase_245_i+$_sum28_i_i)|0);
   var $1224=$1223;
   HEAP32[(($1224)>>2)]=$F4_0_i_i;
   var $_sum29_i_i=((($_sum_i21_i)+(12))|0);
   var $1225=(($tbase_245_i+$_sum29_i_i)|0);
   var $1226=$1225;
   HEAP32[(($1226)>>2)]=$1207;
   label = 303; break;
  case 286: 
   var $1228=$1009;
   var $1229=$qsize_0_i_i >>> 8;
   var $1230=(($1229)|(0))==0;
   if ($1230) { var $I7_0_i_i = 0;label = 289; break; } else { label = 287; break; }
  case 287: 
   var $1232=(($qsize_0_i_i)>>>(0)) > 16777215;
   if ($1232) { var $I7_0_i_i = 31;label = 289; break; } else { label = 288; break; }
  case 288: 
   var $1234=((($1229)+(1048320))|0);
   var $1235=$1234 >>> 16;
   var $1236=$1235 & 8;
   var $1237=$1229 << $1236;
   var $1238=((($1237)+(520192))|0);
   var $1239=$1238 >>> 16;
   var $1240=$1239 & 4;
   var $1241=$1240 | $1236;
   var $1242=$1237 << $1240;
   var $1243=((($1242)+(245760))|0);
   var $1244=$1243 >>> 16;
   var $1245=$1244 & 2;
   var $1246=$1241 | $1245;
   var $1247=(((14)-($1246))|0);
   var $1248=$1242 << $1245;
   var $1249=$1248 >>> 15;
   var $1250=((($1247)+($1249))|0);
   var $1251=$1250 << 1;
   var $1252=((($1250)+(7))|0);
   var $1253=$qsize_0_i_i >>> (($1252)>>>(0));
   var $1254=$1253 & 1;
   var $1255=$1254 | $1251;
   var $I7_0_i_i = $1255;label = 289; break;
  case 289: 
   var $I7_0_i_i;
   var $1257=((1640+($I7_0_i_i<<2))|0);
   var $_sum12_i26_i=((($_sum_i21_i)+(28))|0);
   var $1258=(($tbase_245_i+$_sum12_i26_i)|0);
   var $1259=$1258;
   HEAP32[(($1259)>>2)]=$I7_0_i_i;
   var $_sum13_i_i=((($_sum_i21_i)+(16))|0);
   var $1260=(($tbase_245_i+$_sum13_i_i)|0);
   var $_sum14_i_i=((($_sum_i21_i)+(20))|0);
   var $1261=(($tbase_245_i+$_sum14_i_i)|0);
   var $1262=$1261;
   HEAP32[(($1262)>>2)]=0;
   var $1263=$1260;
   HEAP32[(($1263)>>2)]=0;
   var $1264=HEAP32[((((1340)|0))>>2)];
   var $1265=1 << $I7_0_i_i;
   var $1266=$1264 & $1265;
   var $1267=(($1266)|(0))==0;
   if ($1267) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $1269=$1264 | $1265;
   HEAP32[((((1340)|0))>>2)]=$1269;
   HEAP32[(($1257)>>2)]=$1228;
   var $1270=$1257;
   var $_sum15_i_i=((($_sum_i21_i)+(24))|0);
   var $1271=(($tbase_245_i+$_sum15_i_i)|0);
   var $1272=$1271;
   HEAP32[(($1272)>>2)]=$1270;
   var $_sum16_i_i=((($_sum_i21_i)+(12))|0);
   var $1273=(($tbase_245_i+$_sum16_i_i)|0);
   var $1274=$1273;
   HEAP32[(($1274)>>2)]=$1228;
   var $_sum17_i_i=((($_sum_i21_i)+(8))|0);
   var $1275=(($tbase_245_i+$_sum17_i_i)|0);
   var $1276=$1275;
   HEAP32[(($1276)>>2)]=$1228;
   label = 303; break;
  case 291: 
   var $1278=HEAP32[(($1257)>>2)];
   var $1279=(($I7_0_i_i)|(0))==31;
   if ($1279) { var $1284 = 0;label = 293; break; } else { label = 292; break; }
  case 292: 
   var $1281=$I7_0_i_i >>> 1;
   var $1282=(((25)-($1281))|0);
   var $1284 = $1282;label = 293; break;
  case 293: 
   var $1284;
   var $1285=$qsize_0_i_i << $1284;
   var $K8_0_i_i = $1285;var $T_0_i27_i = $1278;label = 294; break;
  case 294: 
   var $T_0_i27_i;
   var $K8_0_i_i;
   var $1287=(($T_0_i27_i+4)|0);
   var $1288=HEAP32[(($1287)>>2)];
   var $1289=$1288 & -8;
   var $1290=(($1289)|(0))==(($qsize_0_i_i)|(0));
   if ($1290) { label = 299; break; } else { label = 295; break; }
  case 295: 
   var $1292=$K8_0_i_i >>> 31;
   var $1293=(($T_0_i27_i+16+($1292<<2))|0);
   var $1294=HEAP32[(($1293)>>2)];
   var $1295=(($1294)|(0))==0;
   var $1296=$K8_0_i_i << 1;
   if ($1295) { label = 296; break; } else { var $K8_0_i_i = $1296;var $T_0_i27_i = $1294;label = 294; break; }
  case 296: 
   var $1298=$1293;
   var $1299=HEAP32[((((1352)|0))>>2)];
   var $1300=(($1298)>>>(0)) < (($1299)>>>(0));
   if ($1300) { label = 298; break; } else { label = 297; break; }
  case 297: 
   HEAP32[(($1293)>>2)]=$1228;
   var $_sum24_i_i=((($_sum_i21_i)+(24))|0);
   var $1302=(($tbase_245_i+$_sum24_i_i)|0);
   var $1303=$1302;
   HEAP32[(($1303)>>2)]=$T_0_i27_i;
   var $_sum25_i_i=((($_sum_i21_i)+(12))|0);
   var $1304=(($tbase_245_i+$_sum25_i_i)|0);
   var $1305=$1304;
   HEAP32[(($1305)>>2)]=$1228;
   var $_sum26_i_i=((($_sum_i21_i)+(8))|0);
   var $1306=(($tbase_245_i+$_sum26_i_i)|0);
   var $1307=$1306;
   HEAP32[(($1307)>>2)]=$1228;
   label = 303; break;
  case 298: 
   _abort();
   throw "Reached an unreachable!";
  case 299: 
   var $1310=(($T_0_i27_i+8)|0);
   var $1311=HEAP32[(($1310)>>2)];
   var $1312=$T_0_i27_i;
   var $1313=HEAP32[((((1352)|0))>>2)];
   var $1314=(($1312)>>>(0)) < (($1313)>>>(0));
   if ($1314) { label = 302; break; } else { label = 300; break; }
  case 300: 
   var $1316=$1311;
   var $1317=(($1316)>>>(0)) < (($1313)>>>(0));
   if ($1317) { label = 302; break; } else { label = 301; break; }
  case 301: 
   var $1319=(($1311+12)|0);
   HEAP32[(($1319)>>2)]=$1228;
   HEAP32[(($1310)>>2)]=$1228;
   var $_sum21_i_i=((($_sum_i21_i)+(8))|0);
   var $1320=(($tbase_245_i+$_sum21_i_i)|0);
   var $1321=$1320;
   HEAP32[(($1321)>>2)]=$1311;
   var $_sum22_i_i=((($_sum_i21_i)+(12))|0);
   var $1322=(($tbase_245_i+$_sum22_i_i)|0);
   var $1323=$1322;
   HEAP32[(($1323)>>2)]=$T_0_i27_i;
   var $_sum23_i_i=((($_sum_i21_i)+(24))|0);
   var $1324=(($tbase_245_i+$_sum23_i_i)|0);
   var $1325=$1324;
   HEAP32[(($1325)>>2)]=0;
   label = 303; break;
  case 302: 
   _abort();
   throw "Reached an unreachable!";
  case 303: 
   var $_sum1819_i_i=$993 | 8;
   var $1326=(($tbase_245_i+$_sum1819_i_i)|0);
   var $mem_0 = $1326;label = 341; break;
  case 304: 
   var $1327=$890;
   var $sp_0_i_i_i = ((1784)|0);label = 305; break;
  case 305: 
   var $sp_0_i_i_i;
   var $1329=(($sp_0_i_i_i)|0);
   var $1330=HEAP32[(($1329)>>2)];
   var $1331=(($1330)>>>(0)) > (($1327)>>>(0));
   if ($1331) { label = 307; break; } else { label = 306; break; }
  case 306: 
   var $1333=(($sp_0_i_i_i+4)|0);
   var $1334=HEAP32[(($1333)>>2)];
   var $1335=(($1330+$1334)|0);
   var $1336=(($1335)>>>(0)) > (($1327)>>>(0));
   if ($1336) { label = 308; break; } else { label = 307; break; }
  case 307: 
   var $1338=(($sp_0_i_i_i+8)|0);
   var $1339=HEAP32[(($1338)>>2)];
   var $sp_0_i_i_i = $1339;label = 305; break;
  case 308: 
   var $_sum_i15_i=((($1334)-(47))|0);
   var $_sum1_i16_i=((($1334)-(39))|0);
   var $1340=(($1330+$_sum1_i16_i)|0);
   var $1341=$1340;
   var $1342=$1341 & 7;
   var $1343=(($1342)|(0))==0;
   if ($1343) { var $1348 = 0;label = 310; break; } else { label = 309; break; }
  case 309: 
   var $1345=(((-$1341))|0);
   var $1346=$1345 & 7;
   var $1348 = $1346;label = 310; break;
  case 310: 
   var $1348;
   var $_sum2_i17_i=((($_sum_i15_i)+($1348))|0);
   var $1349=(($1330+$_sum2_i17_i)|0);
   var $1350=(($890+16)|0);
   var $1351=$1350;
   var $1352=(($1349)>>>(0)) < (($1351)>>>(0));
   var $1353=$1352 ? $1327 : $1349;
   var $1354=(($1353+8)|0);
   var $1355=$1354;
   var $1356=((($tsize_244_i)-(40))|0);
   var $1357=(($tbase_245_i+8)|0);
   var $1358=$1357;
   var $1359=$1358 & 7;
   var $1360=(($1359)|(0))==0;
   if ($1360) { var $1364 = 0;label = 312; break; } else { label = 311; break; }
  case 311: 
   var $1362=(((-$1358))|0);
   var $1363=$1362 & 7;
   var $1364 = $1363;label = 312; break;
  case 312: 
   var $1364;
   var $1365=(($tbase_245_i+$1364)|0);
   var $1366=$1365;
   var $1367=((($1356)-($1364))|0);
   HEAP32[((((1360)|0))>>2)]=$1366;
   HEAP32[((((1348)|0))>>2)]=$1367;
   var $1368=$1367 | 1;
   var $_sum_i_i_i=((($1364)+(4))|0);
   var $1369=(($tbase_245_i+$_sum_i_i_i)|0);
   var $1370=$1369;
   HEAP32[(($1370)>>2)]=$1368;
   var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
   var $1371=(($tbase_245_i+$_sum2_i_i_i)|0);
   var $1372=$1371;
   HEAP32[(($1372)>>2)]=40;
   var $1373=HEAP32[((((1328)|0))>>2)];
   HEAP32[((((1364)|0))>>2)]=$1373;
   var $1374=(($1353+4)|0);
   var $1375=$1374;
   HEAP32[(($1375)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($1354)>>2)]=HEAP32[(((((1784)|0)))>>2)];HEAP32[((($1354)+(4))>>2)]=HEAP32[((((((1784)|0)))+(4))>>2)];HEAP32[((($1354)+(8))>>2)]=HEAP32[((((((1784)|0)))+(8))>>2)];HEAP32[((($1354)+(12))>>2)]=HEAP32[((((((1784)|0)))+(12))>>2)];
   HEAP32[((((1784)|0))>>2)]=$tbase_245_i;
   HEAP32[((((1788)|0))>>2)]=$tsize_244_i;
   HEAP32[((((1796)|0))>>2)]=0;
   HEAP32[((((1792)|0))>>2)]=$1355;
   var $1376=(($1353+28)|0);
   var $1377=$1376;
   HEAP32[(($1377)>>2)]=7;
   var $1378=(($1353+32)|0);
   var $1379=(($1378)>>>(0)) < (($1335)>>>(0));
   if ($1379) { var $1380 = $1377;label = 313; break; } else { label = 314; break; }
  case 313: 
   var $1380;
   var $1381=(($1380+4)|0);
   HEAP32[(($1381)>>2)]=7;
   var $1382=(($1380+8)|0);
   var $1383=$1382;
   var $1384=(($1383)>>>(0)) < (($1335)>>>(0));
   if ($1384) { var $1380 = $1381;label = 313; break; } else { label = 314; break; }
  case 314: 
   var $1385=(($1353)|(0))==(($1327)|(0));
   if ($1385) { label = 338; break; } else { label = 315; break; }
  case 315: 
   var $1387=$1353;
   var $1388=$890;
   var $1389=((($1387)-($1388))|0);
   var $1390=(($1327+$1389)|0);
   var $_sum3_i_i=((($1389)+(4))|0);
   var $1391=(($1327+$_sum3_i_i)|0);
   var $1392=$1391;
   var $1393=HEAP32[(($1392)>>2)];
   var $1394=$1393 & -2;
   HEAP32[(($1392)>>2)]=$1394;
   var $1395=$1389 | 1;
   var $1396=(($890+4)|0);
   HEAP32[(($1396)>>2)]=$1395;
   var $1397=$1390;
   HEAP32[(($1397)>>2)]=$1389;
   var $1398=$1389 >>> 3;
   var $1399=(($1389)>>>(0)) < 256;
   if ($1399) { label = 316; break; } else { label = 321; break; }
  case 316: 
   var $1401=$1398 << 1;
   var $1402=((1376+($1401<<2))|0);
   var $1403=$1402;
   var $1404=HEAP32[((((1336)|0))>>2)];
   var $1405=1 << $1398;
   var $1406=$1404 & $1405;
   var $1407=(($1406)|(0))==0;
   if ($1407) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $1409=$1404 | $1405;
   HEAP32[((((1336)|0))>>2)]=$1409;
   var $_sum11_pre_i_i=((($1401)+(2))|0);
   var $_pre_i_i=((1376+($_sum11_pre_i_i<<2))|0);
   var $F_0_i_i = $1403;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $_sum12_i_i=((($1401)+(2))|0);
   var $1411=((1376+($_sum12_i_i<<2))|0);
   var $1412=HEAP32[(($1411)>>2)];
   var $1413=$1412;
   var $1414=HEAP32[((((1352)|0))>>2)];
   var $1415=(($1413)>>>(0)) < (($1414)>>>(0));
   if ($1415) { label = 319; break; } else { var $F_0_i_i = $1412;var $_pre_phi_i_i = $1411;label = 320; break; }
  case 319: 
   _abort();
   throw "Reached an unreachable!";
  case 320: 
   var $_pre_phi_i_i;
   var $F_0_i_i;
   HEAP32[(($_pre_phi_i_i)>>2)]=$890;
   var $1418=(($F_0_i_i+12)|0);
   HEAP32[(($1418)>>2)]=$890;
   var $1419=(($890+8)|0);
   HEAP32[(($1419)>>2)]=$F_0_i_i;
   var $1420=(($890+12)|0);
   HEAP32[(($1420)>>2)]=$1403;
   label = 338; break;
  case 321: 
   var $1422=$890;
   var $1423=$1389 >>> 8;
   var $1424=(($1423)|(0))==0;
   if ($1424) { var $I1_0_i_i = 0;label = 324; break; } else { label = 322; break; }
  case 322: 
   var $1426=(($1389)>>>(0)) > 16777215;
   if ($1426) { var $I1_0_i_i = 31;label = 324; break; } else { label = 323; break; }
  case 323: 
   var $1428=((($1423)+(1048320))|0);
   var $1429=$1428 >>> 16;
   var $1430=$1429 & 8;
   var $1431=$1423 << $1430;
   var $1432=((($1431)+(520192))|0);
   var $1433=$1432 >>> 16;
   var $1434=$1433 & 4;
   var $1435=$1434 | $1430;
   var $1436=$1431 << $1434;
   var $1437=((($1436)+(245760))|0);
   var $1438=$1437 >>> 16;
   var $1439=$1438 & 2;
   var $1440=$1435 | $1439;
   var $1441=(((14)-($1440))|0);
   var $1442=$1436 << $1439;
   var $1443=$1442 >>> 15;
   var $1444=((($1441)+($1443))|0);
   var $1445=$1444 << 1;
   var $1446=((($1444)+(7))|0);
   var $1447=$1389 >>> (($1446)>>>(0));
   var $1448=$1447 & 1;
   var $1449=$1448 | $1445;
   var $I1_0_i_i = $1449;label = 324; break;
  case 324: 
   var $I1_0_i_i;
   var $1451=((1640+($I1_0_i_i<<2))|0);
   var $1452=(($890+28)|0);
   var $I1_0_c_i_i=$I1_0_i_i;
   HEAP32[(($1452)>>2)]=$I1_0_c_i_i;
   var $1453=(($890+20)|0);
   HEAP32[(($1453)>>2)]=0;
   var $1454=(($890+16)|0);
   HEAP32[(($1454)>>2)]=0;
   var $1455=HEAP32[((((1340)|0))>>2)];
   var $1456=1 << $I1_0_i_i;
   var $1457=$1455 & $1456;
   var $1458=(($1457)|(0))==0;
   if ($1458) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $1460=$1455 | $1456;
   HEAP32[((((1340)|0))>>2)]=$1460;
   HEAP32[(($1451)>>2)]=$1422;
   var $1461=(($890+24)|0);
   var $_c_i_i=$1451;
   HEAP32[(($1461)>>2)]=$_c_i_i;
   var $1462=(($890+12)|0);
   HEAP32[(($1462)>>2)]=$890;
   var $1463=(($890+8)|0);
   HEAP32[(($1463)>>2)]=$890;
   label = 338; break;
  case 326: 
   var $1465=HEAP32[(($1451)>>2)];
   var $1466=(($I1_0_i_i)|(0))==31;
   if ($1466) { var $1471 = 0;label = 328; break; } else { label = 327; break; }
  case 327: 
   var $1468=$I1_0_i_i >>> 1;
   var $1469=(((25)-($1468))|0);
   var $1471 = $1469;label = 328; break;
  case 328: 
   var $1471;
   var $1472=$1389 << $1471;
   var $K2_0_i_i = $1472;var $T_0_i_i = $1465;label = 329; break;
  case 329: 
   var $T_0_i_i;
   var $K2_0_i_i;
   var $1474=(($T_0_i_i+4)|0);
   var $1475=HEAP32[(($1474)>>2)];
   var $1476=$1475 & -8;
   var $1477=(($1476)|(0))==(($1389)|(0));
   if ($1477) { label = 334; break; } else { label = 330; break; }
  case 330: 
   var $1479=$K2_0_i_i >>> 31;
   var $1480=(($T_0_i_i+16+($1479<<2))|0);
   var $1481=HEAP32[(($1480)>>2)];
   var $1482=(($1481)|(0))==0;
   var $1483=$K2_0_i_i << 1;
   if ($1482) { label = 331; break; } else { var $K2_0_i_i = $1483;var $T_0_i_i = $1481;label = 329; break; }
  case 331: 
   var $1485=$1480;
   var $1486=HEAP32[((((1352)|0))>>2)];
   var $1487=(($1485)>>>(0)) < (($1486)>>>(0));
   if ($1487) { label = 333; break; } else { label = 332; break; }
  case 332: 
   HEAP32[(($1480)>>2)]=$1422;
   var $1489=(($890+24)|0);
   var $T_0_c8_i_i=$T_0_i_i;
   HEAP32[(($1489)>>2)]=$T_0_c8_i_i;
   var $1490=(($890+12)|0);
   HEAP32[(($1490)>>2)]=$890;
   var $1491=(($890+8)|0);
   HEAP32[(($1491)>>2)]=$890;
   label = 338; break;
  case 333: 
   _abort();
   throw "Reached an unreachable!";
  case 334: 
   var $1494=(($T_0_i_i+8)|0);
   var $1495=HEAP32[(($1494)>>2)];
   var $1496=$T_0_i_i;
   var $1497=HEAP32[((((1352)|0))>>2)];
   var $1498=(($1496)>>>(0)) < (($1497)>>>(0));
   if ($1498) { label = 337; break; } else { label = 335; break; }
  case 335: 
   var $1500=$1495;
   var $1501=(($1500)>>>(0)) < (($1497)>>>(0));
   if ($1501) { label = 337; break; } else { label = 336; break; }
  case 336: 
   var $1503=(($1495+12)|0);
   HEAP32[(($1503)>>2)]=$1422;
   HEAP32[(($1494)>>2)]=$1422;
   var $1504=(($890+8)|0);
   var $_c7_i_i=$1495;
   HEAP32[(($1504)>>2)]=$_c7_i_i;
   var $1505=(($890+12)|0);
   var $T_0_c_i_i=$T_0_i_i;
   HEAP32[(($1505)>>2)]=$T_0_c_i_i;
   var $1506=(($890+24)|0);
   HEAP32[(($1506)>>2)]=0;
   label = 338; break;
  case 337: 
   _abort();
   throw "Reached an unreachable!";
  case 338: 
   var $1507=HEAP32[((((1348)|0))>>2)];
   var $1508=(($1507)>>>(0)) > (($nb_0)>>>(0));
   if ($1508) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $1510=((($1507)-($nb_0))|0);
   HEAP32[((((1348)|0))>>2)]=$1510;
   var $1511=HEAP32[((((1360)|0))>>2)];
   var $1512=$1511;
   var $1513=(($1512+$nb_0)|0);
   var $1514=$1513;
   HEAP32[((((1360)|0))>>2)]=$1514;
   var $1515=$1510 | 1;
   var $_sum_i134=((($nb_0)+(4))|0);
   var $1516=(($1512+$_sum_i134)|0);
   var $1517=$1516;
   HEAP32[(($1517)>>2)]=$1515;
   var $1518=$nb_0 | 3;
   var $1519=(($1511+4)|0);
   HEAP32[(($1519)>>2)]=$1518;
   var $1520=(($1511+8)|0);
   var $1521=$1520;
   var $mem_0 = $1521;label = 341; break;
  case 340: 
   var $1522=___errno_location();
   HEAP32[(($1522)>>2)]=12;
   var $mem_0 = 0;label = 341; break;
  case 341: 
   var $mem_0;
   return $mem_0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_malloc"] = _malloc;
function _free($mem) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $1=(($mem)|(0))==0;
   if ($1) { label = 140; break; } else { label = 2; break; }
  case 2: 
   var $3=((($mem)-(8))|0);
   var $4=$3;
   var $5=HEAP32[((((1352)|0))>>2)];
   var $6=(($3)>>>(0)) < (($5)>>>(0));
   if ($6) { label = 139; break; } else { label = 3; break; }
  case 3: 
   var $8=((($mem)-(4))|0);
   var $9=$8;
   var $10=HEAP32[(($9)>>2)];
   var $11=$10 & 3;
   var $12=(($11)|(0))==1;
   if ($12) { label = 139; break; } else { label = 4; break; }
  case 4: 
   var $14=$10 & -8;
   var $_sum=((($14)-(8))|0);
   var $15=(($mem+$_sum)|0);
   var $16=$15;
   var $17=$10 & 1;
   var $18=(($17)|(0))==0;
   if ($18) { label = 5; break; } else { var $p_0 = $4;var $psize_0 = $14;label = 56; break; }
  case 5: 
   var $20=$3;
   var $21=HEAP32[(($20)>>2)];
   var $22=(($11)|(0))==0;
   if ($22) { label = 140; break; } else { label = 6; break; }
  case 6: 
   var $_sum232=(((-8)-($21))|0);
   var $24=(($mem+$_sum232)|0);
   var $25=$24;
   var $26=((($21)+($14))|0);
   var $27=(($24)>>>(0)) < (($5)>>>(0));
   if ($27) { label = 139; break; } else { label = 7; break; }
  case 7: 
   var $29=HEAP32[((((1356)|0))>>2)];
   var $30=(($25)|(0))==(($29)|(0));
   if ($30) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $32=$21 >>> 3;
   var $33=(($21)>>>(0)) < 256;
   if ($33) { label = 9; break; } else { label = 21; break; }
  case 9: 
   var $_sum276=((($_sum232)+(8))|0);
   var $35=(($mem+$_sum276)|0);
   var $36=$35;
   var $37=HEAP32[(($36)>>2)];
   var $_sum277=((($_sum232)+(12))|0);
   var $38=(($mem+$_sum277)|0);
   var $39=$38;
   var $40=HEAP32[(($39)>>2)];
   var $41=$32 << 1;
   var $42=((1376+($41<<2))|0);
   var $43=$42;
   var $44=(($37)|(0))==(($43)|(0));
   if ($44) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $46=$37;
   var $47=(($46)>>>(0)) < (($5)>>>(0));
   if ($47) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $49=(($37+12)|0);
   var $50=HEAP32[(($49)>>2)];
   var $51=(($50)|(0))==(($25)|(0));
   if ($51) { label = 12; break; } else { label = 20; break; }
  case 12: 
   var $52=(($40)|(0))==(($37)|(0));
   if ($52) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $54=1 << $32;
   var $55=$54 ^ -1;
   var $56=HEAP32[((((1336)|0))>>2)];
   var $57=$56 & $55;
   HEAP32[((((1336)|0))>>2)]=$57;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 14: 
   var $59=(($40)|(0))==(($43)|(0));
   if ($59) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $_pre305=(($40+8)|0);
   var $_pre_phi306 = $_pre305;label = 18; break;
  case 16: 
   var $61=$40;
   var $62=(($61)>>>(0)) < (($5)>>>(0));
   if ($62) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $64=(($40+8)|0);
   var $65=HEAP32[(($64)>>2)];
   var $66=(($65)|(0))==(($25)|(0));
   if ($66) { var $_pre_phi306 = $64;label = 18; break; } else { label = 19; break; }
  case 18: 
   var $_pre_phi306;
   var $67=(($37+12)|0);
   HEAP32[(($67)>>2)]=$40;
   HEAP32[(($_pre_phi306)>>2)]=$37;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   _abort();
   throw "Reached an unreachable!";
  case 21: 
   var $69=$24;
   var $_sum266=((($_sum232)+(24))|0);
   var $70=(($mem+$_sum266)|0);
   var $71=$70;
   var $72=HEAP32[(($71)>>2)];
   var $_sum267=((($_sum232)+(12))|0);
   var $73=(($mem+$_sum267)|0);
   var $74=$73;
   var $75=HEAP32[(($74)>>2)];
   var $76=(($75)|(0))==(($69)|(0));
   if ($76) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $_sum273=((($_sum232)+(8))|0);
   var $78=(($mem+$_sum273)|0);
   var $79=$78;
   var $80=HEAP32[(($79)>>2)];
   var $81=$80;
   var $82=(($81)>>>(0)) < (($5)>>>(0));
   if ($82) { label = 26; break; } else { label = 23; break; }
  case 23: 
   var $84=(($80+12)|0);
   var $85=HEAP32[(($84)>>2)];
   var $86=(($85)|(0))==(($69)|(0));
   if ($86) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $88=(($75+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($89)|(0))==(($69)|(0));
   if ($90) { label = 25; break; } else { label = 26; break; }
  case 25: 
   HEAP32[(($84)>>2)]=$75;
   HEAP32[(($88)>>2)]=$80;
   var $R_1 = $75;label = 34; break;
  case 26: 
   _abort();
   throw "Reached an unreachable!";
  case 27: 
   var $_sum269=((($_sum232)+(20))|0);
   var $93=(($mem+$_sum269)|0);
   var $94=$93;
   var $95=HEAP32[(($94)>>2)];
   var $96=(($95)|(0))==0;
   if ($96) { label = 28; break; } else { var $R_0 = $95;var $RP_0 = $94;label = 29; break; }
  case 28: 
   var $_sum268=((($_sum232)+(16))|0);
   var $98=(($mem+$_sum268)|0);
   var $99=$98;
   var $100=HEAP32[(($99)>>2)];
   var $101=(($100)|(0))==0;
   if ($101) { var $R_1 = 0;label = 34; break; } else { var $R_0 = $100;var $RP_0 = $99;label = 29; break; }
  case 29: 
   var $RP_0;
   var $R_0;
   var $102=(($R_0+20)|0);
   var $103=HEAP32[(($102)>>2)];
   var $104=(($103)|(0))==0;
   if ($104) { label = 30; break; } else { var $R_0 = $103;var $RP_0 = $102;label = 29; break; }
  case 30: 
   var $106=(($R_0+16)|0);
   var $107=HEAP32[(($106)>>2)];
   var $108=(($107)|(0))==0;
   if ($108) { label = 31; break; } else { var $R_0 = $107;var $RP_0 = $106;label = 29; break; }
  case 31: 
   var $110=$RP_0;
   var $111=(($110)>>>(0)) < (($5)>>>(0));
   if ($111) { label = 33; break; } else { label = 32; break; }
  case 32: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 34; break;
  case 33: 
   _abort();
   throw "Reached an unreachable!";
  case 34: 
   var $R_1;
   var $115=(($72)|(0))==0;
   if ($115) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 35; break; }
  case 35: 
   var $_sum270=((($_sum232)+(28))|0);
   var $117=(($mem+$_sum270)|0);
   var $118=$117;
   var $119=HEAP32[(($118)>>2)];
   var $120=((1640+($119<<2))|0);
   var $121=HEAP32[(($120)>>2)];
   var $122=(($69)|(0))==(($121)|(0));
   if ($122) { label = 36; break; } else { label = 38; break; }
  case 36: 
   HEAP32[(($120)>>2)]=$R_1;
   var $cond=(($R_1)|(0))==0;
   if ($cond) { label = 37; break; } else { label = 44; break; }
  case 37: 
   var $124=HEAP32[(($118)>>2)];
   var $125=1 << $124;
   var $126=$125 ^ -1;
   var $127=HEAP32[((((1340)|0))>>2)];
   var $128=$127 & $126;
   HEAP32[((((1340)|0))>>2)]=$128;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 38: 
   var $130=$72;
   var $131=HEAP32[((((1352)|0))>>2)];
   var $132=(($130)>>>(0)) < (($131)>>>(0));
   if ($132) { label = 42; break; } else { label = 39; break; }
  case 39: 
   var $134=(($72+16)|0);
   var $135=HEAP32[(($134)>>2)];
   var $136=(($135)|(0))==(($69)|(0));
   if ($136) { label = 40; break; } else { label = 41; break; }
  case 40: 
   HEAP32[(($134)>>2)]=$R_1;
   label = 43; break;
  case 41: 
   var $139=(($72+20)|0);
   HEAP32[(($139)>>2)]=$R_1;
   label = 43; break;
  case 42: 
   _abort();
   throw "Reached an unreachable!";
  case 43: 
   var $142=(($R_1)|(0))==0;
   if ($142) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 44; break; }
  case 44: 
   var $144=$R_1;
   var $145=HEAP32[((((1352)|0))>>2)];
   var $146=(($144)>>>(0)) < (($145)>>>(0));
   if ($146) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $148=(($R_1+24)|0);
   HEAP32[(($148)>>2)]=$72;
   var $_sum271=((($_sum232)+(16))|0);
   var $149=(($mem+$_sum271)|0);
   var $150=$149;
   var $151=HEAP32[(($150)>>2)];
   var $152=(($151)|(0))==0;
   if ($152) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $154=$151;
   var $155=HEAP32[((((1352)|0))>>2)];
   var $156=(($154)>>>(0)) < (($155)>>>(0));
   if ($156) { label = 48; break; } else { label = 47; break; }
  case 47: 
   var $158=(($R_1+16)|0);
   HEAP32[(($158)>>2)]=$151;
   var $159=(($151+24)|0);
   HEAP32[(($159)>>2)]=$R_1;
   label = 49; break;
  case 48: 
   _abort();
   throw "Reached an unreachable!";
  case 49: 
   var $_sum272=((($_sum232)+(20))|0);
   var $162=(($mem+$_sum272)|0);
   var $163=$162;
   var $164=HEAP32[(($163)>>2)];
   var $165=(($164)|(0))==0;
   if ($165) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $167=$164;
   var $168=HEAP32[((((1352)|0))>>2)];
   var $169=(($167)>>>(0)) < (($168)>>>(0));
   if ($169) { label = 52; break; } else { label = 51; break; }
  case 51: 
   var $171=(($R_1+20)|0);
   HEAP32[(($171)>>2)]=$164;
   var $172=(($164+24)|0);
   HEAP32[(($172)>>2)]=$R_1;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 52: 
   _abort();
   throw "Reached an unreachable!";
  case 53: 
   _abort();
   throw "Reached an unreachable!";
  case 54: 
   var $_sum233=((($14)-(4))|0);
   var $176=(($mem+$_sum233)|0);
   var $177=$176;
   var $178=HEAP32[(($177)>>2)];
   var $179=$178 & 3;
   var $180=(($179)|(0))==3;
   if ($180) { label = 55; break; } else { var $p_0 = $25;var $psize_0 = $26;label = 56; break; }
  case 55: 
   HEAP32[((((1344)|0))>>2)]=$26;
   var $182=HEAP32[(($177)>>2)];
   var $183=$182 & -2;
   HEAP32[(($177)>>2)]=$183;
   var $184=$26 | 1;
   var $_sum264=((($_sum232)+(4))|0);
   var $185=(($mem+$_sum264)|0);
   var $186=$185;
   HEAP32[(($186)>>2)]=$184;
   var $187=$15;
   HEAP32[(($187)>>2)]=$26;
   label = 140; break;
  case 56: 
   var $psize_0;
   var $p_0;
   var $189=$p_0;
   var $190=(($189)>>>(0)) < (($15)>>>(0));
   if ($190) { label = 57; break; } else { label = 139; break; }
  case 57: 
   var $_sum263=((($14)-(4))|0);
   var $192=(($mem+$_sum263)|0);
   var $193=$192;
   var $194=HEAP32[(($193)>>2)];
   var $195=$194 & 1;
   var $phitmp=(($195)|(0))==0;
   if ($phitmp) { label = 139; break; } else { label = 58; break; }
  case 58: 
   var $197=$194 & 2;
   var $198=(($197)|(0))==0;
   if ($198) { label = 59; break; } else { label = 112; break; }
  case 59: 
   var $200=HEAP32[((((1360)|0))>>2)];
   var $201=(($16)|(0))==(($200)|(0));
   if ($201) { label = 60; break; } else { label = 62; break; }
  case 60: 
   var $203=HEAP32[((((1348)|0))>>2)];
   var $204=((($203)+($psize_0))|0);
   HEAP32[((((1348)|0))>>2)]=$204;
   HEAP32[((((1360)|0))>>2)]=$p_0;
   var $205=$204 | 1;
   var $206=(($p_0+4)|0);
   HEAP32[(($206)>>2)]=$205;
   var $207=HEAP32[((((1356)|0))>>2)];
   var $208=(($p_0)|(0))==(($207)|(0));
   if ($208) { label = 61; break; } else { label = 140; break; }
  case 61: 
   HEAP32[((((1356)|0))>>2)]=0;
   HEAP32[((((1344)|0))>>2)]=0;
   label = 140; break;
  case 62: 
   var $211=HEAP32[((((1356)|0))>>2)];
   var $212=(($16)|(0))==(($211)|(0));
   if ($212) { label = 63; break; } else { label = 64; break; }
  case 63: 
   var $214=HEAP32[((((1344)|0))>>2)];
   var $215=((($214)+($psize_0))|0);
   HEAP32[((((1344)|0))>>2)]=$215;
   HEAP32[((((1356)|0))>>2)]=$p_0;
   var $216=$215 | 1;
   var $217=(($p_0+4)|0);
   HEAP32[(($217)>>2)]=$216;
   var $218=(($189+$215)|0);
   var $219=$218;
   HEAP32[(($219)>>2)]=$215;
   label = 140; break;
  case 64: 
   var $221=$194 & -8;
   var $222=((($221)+($psize_0))|0);
   var $223=$194 >>> 3;
   var $224=(($194)>>>(0)) < 256;
   if ($224) { label = 65; break; } else { label = 77; break; }
  case 65: 
   var $226=(($mem+$14)|0);
   var $227=$226;
   var $228=HEAP32[(($227)>>2)];
   var $_sum257258=$14 | 4;
   var $229=(($mem+$_sum257258)|0);
   var $230=$229;
   var $231=HEAP32[(($230)>>2)];
   var $232=$223 << 1;
   var $233=((1376+($232<<2))|0);
   var $234=$233;
   var $235=(($228)|(0))==(($234)|(0));
   if ($235) { label = 68; break; } else { label = 66; break; }
  case 66: 
   var $237=$228;
   var $238=HEAP32[((((1352)|0))>>2)];
   var $239=(($237)>>>(0)) < (($238)>>>(0));
   if ($239) { label = 76; break; } else { label = 67; break; }
  case 67: 
   var $241=(($228+12)|0);
   var $242=HEAP32[(($241)>>2)];
   var $243=(($242)|(0))==(($16)|(0));
   if ($243) { label = 68; break; } else { label = 76; break; }
  case 68: 
   var $244=(($231)|(0))==(($228)|(0));
   if ($244) { label = 69; break; } else { label = 70; break; }
  case 69: 
   var $246=1 << $223;
   var $247=$246 ^ -1;
   var $248=HEAP32[((((1336)|0))>>2)];
   var $249=$248 & $247;
   HEAP32[((((1336)|0))>>2)]=$249;
   label = 110; break;
  case 70: 
   var $251=(($231)|(0))==(($234)|(0));
   if ($251) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $_pre303=(($231+8)|0);
   var $_pre_phi304 = $_pre303;label = 74; break;
  case 72: 
   var $253=$231;
   var $254=HEAP32[((((1352)|0))>>2)];
   var $255=(($253)>>>(0)) < (($254)>>>(0));
   if ($255) { label = 75; break; } else { label = 73; break; }
  case 73: 
   var $257=(($231+8)|0);
   var $258=HEAP32[(($257)>>2)];
   var $259=(($258)|(0))==(($16)|(0));
   if ($259) { var $_pre_phi304 = $257;label = 74; break; } else { label = 75; break; }
  case 74: 
   var $_pre_phi304;
   var $260=(($228+12)|0);
   HEAP32[(($260)>>2)]=$231;
   HEAP32[(($_pre_phi304)>>2)]=$228;
   label = 110; break;
  case 75: 
   _abort();
   throw "Reached an unreachable!";
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $262=$15;
   var $_sum235=((($14)+(16))|0);
   var $263=(($mem+$_sum235)|0);
   var $264=$263;
   var $265=HEAP32[(($264)>>2)];
   var $_sum236237=$14 | 4;
   var $266=(($mem+$_sum236237)|0);
   var $267=$266;
   var $268=HEAP32[(($267)>>2)];
   var $269=(($268)|(0))==(($262)|(0));
   if ($269) { label = 83; break; } else { label = 78; break; }
  case 78: 
   var $271=(($mem+$14)|0);
   var $272=$271;
   var $273=HEAP32[(($272)>>2)];
   var $274=$273;
   var $275=HEAP32[((((1352)|0))>>2)];
   var $276=(($274)>>>(0)) < (($275)>>>(0));
   if ($276) { label = 82; break; } else { label = 79; break; }
  case 79: 
   var $278=(($273+12)|0);
   var $279=HEAP32[(($278)>>2)];
   var $280=(($279)|(0))==(($262)|(0));
   if ($280) { label = 80; break; } else { label = 82; break; }
  case 80: 
   var $282=(($268+8)|0);
   var $283=HEAP32[(($282)>>2)];
   var $284=(($283)|(0))==(($262)|(0));
   if ($284) { label = 81; break; } else { label = 82; break; }
  case 81: 
   HEAP32[(($278)>>2)]=$268;
   HEAP32[(($282)>>2)]=$273;
   var $R7_1 = $268;label = 90; break;
  case 82: 
   _abort();
   throw "Reached an unreachable!";
  case 83: 
   var $_sum239=((($14)+(12))|0);
   var $287=(($mem+$_sum239)|0);
   var $288=$287;
   var $289=HEAP32[(($288)>>2)];
   var $290=(($289)|(0))==0;
   if ($290) { label = 84; break; } else { var $R7_0 = $289;var $RP9_0 = $288;label = 85; break; }
  case 84: 
   var $_sum238=((($14)+(8))|0);
   var $292=(($mem+$_sum238)|0);
   var $293=$292;
   var $294=HEAP32[(($293)>>2)];
   var $295=(($294)|(0))==0;
   if ($295) { var $R7_1 = 0;label = 90; break; } else { var $R7_0 = $294;var $RP9_0 = $293;label = 85; break; }
  case 85: 
   var $RP9_0;
   var $R7_0;
   var $296=(($R7_0+20)|0);
   var $297=HEAP32[(($296)>>2)];
   var $298=(($297)|(0))==0;
   if ($298) { label = 86; break; } else { var $R7_0 = $297;var $RP9_0 = $296;label = 85; break; }
  case 86: 
   var $300=(($R7_0+16)|0);
   var $301=HEAP32[(($300)>>2)];
   var $302=(($301)|(0))==0;
   if ($302) { label = 87; break; } else { var $R7_0 = $301;var $RP9_0 = $300;label = 85; break; }
  case 87: 
   var $304=$RP9_0;
   var $305=HEAP32[((((1352)|0))>>2)];
   var $306=(($304)>>>(0)) < (($305)>>>(0));
   if ($306) { label = 89; break; } else { label = 88; break; }
  case 88: 
   HEAP32[(($RP9_0)>>2)]=0;
   var $R7_1 = $R7_0;label = 90; break;
  case 89: 
   _abort();
   throw "Reached an unreachable!";
  case 90: 
   var $R7_1;
   var $310=(($265)|(0))==0;
   if ($310) { label = 110; break; } else { label = 91; break; }
  case 91: 
   var $_sum250=((($14)+(20))|0);
   var $312=(($mem+$_sum250)|0);
   var $313=$312;
   var $314=HEAP32[(($313)>>2)];
   var $315=((1640+($314<<2))|0);
   var $316=HEAP32[(($315)>>2)];
   var $317=(($262)|(0))==(($316)|(0));
   if ($317) { label = 92; break; } else { label = 94; break; }
  case 92: 
   HEAP32[(($315)>>2)]=$R7_1;
   var $cond298=(($R7_1)|(0))==0;
   if ($cond298) { label = 93; break; } else { label = 100; break; }
  case 93: 
   var $319=HEAP32[(($313)>>2)];
   var $320=1 << $319;
   var $321=$320 ^ -1;
   var $322=HEAP32[((((1340)|0))>>2)];
   var $323=$322 & $321;
   HEAP32[((((1340)|0))>>2)]=$323;
   label = 110; break;
  case 94: 
   var $325=$265;
   var $326=HEAP32[((((1352)|0))>>2)];
   var $327=(($325)>>>(0)) < (($326)>>>(0));
   if ($327) { label = 98; break; } else { label = 95; break; }
  case 95: 
   var $329=(($265+16)|0);
   var $330=HEAP32[(($329)>>2)];
   var $331=(($330)|(0))==(($262)|(0));
   if ($331) { label = 96; break; } else { label = 97; break; }
  case 96: 
   HEAP32[(($329)>>2)]=$R7_1;
   label = 99; break;
  case 97: 
   var $334=(($265+20)|0);
   HEAP32[(($334)>>2)]=$R7_1;
   label = 99; break;
  case 98: 
   _abort();
   throw "Reached an unreachable!";
  case 99: 
   var $337=(($R7_1)|(0))==0;
   if ($337) { label = 110; break; } else { label = 100; break; }
  case 100: 
   var $339=$R7_1;
   var $340=HEAP32[((((1352)|0))>>2)];
   var $341=(($339)>>>(0)) < (($340)>>>(0));
   if ($341) { label = 109; break; } else { label = 101; break; }
  case 101: 
   var $343=(($R7_1+24)|0);
   HEAP32[(($343)>>2)]=$265;
   var $_sum251=((($14)+(8))|0);
   var $344=(($mem+$_sum251)|0);
   var $345=$344;
   var $346=HEAP32[(($345)>>2)];
   var $347=(($346)|(0))==0;
   if ($347) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $349=$346;
   var $350=HEAP32[((((1352)|0))>>2)];
   var $351=(($349)>>>(0)) < (($350)>>>(0));
   if ($351) { label = 104; break; } else { label = 103; break; }
  case 103: 
   var $353=(($R7_1+16)|0);
   HEAP32[(($353)>>2)]=$346;
   var $354=(($346+24)|0);
   HEAP32[(($354)>>2)]=$R7_1;
   label = 105; break;
  case 104: 
   _abort();
   throw "Reached an unreachable!";
  case 105: 
   var $_sum252=((($14)+(12))|0);
   var $357=(($mem+$_sum252)|0);
   var $358=$357;
   var $359=HEAP32[(($358)>>2)];
   var $360=(($359)|(0))==0;
   if ($360) { label = 110; break; } else { label = 106; break; }
  case 106: 
   var $362=$359;
   var $363=HEAP32[((((1352)|0))>>2)];
   var $364=(($362)>>>(0)) < (($363)>>>(0));
   if ($364) { label = 108; break; } else { label = 107; break; }
  case 107: 
   var $366=(($R7_1+20)|0);
   HEAP32[(($366)>>2)]=$359;
   var $367=(($359+24)|0);
   HEAP32[(($367)>>2)]=$R7_1;
   label = 110; break;
  case 108: 
   _abort();
   throw "Reached an unreachable!";
  case 109: 
   _abort();
   throw "Reached an unreachable!";
  case 110: 
   var $371=$222 | 1;
   var $372=(($p_0+4)|0);
   HEAP32[(($372)>>2)]=$371;
   var $373=(($189+$222)|0);
   var $374=$373;
   HEAP32[(($374)>>2)]=$222;
   var $375=HEAP32[((((1356)|0))>>2)];
   var $376=(($p_0)|(0))==(($375)|(0));
   if ($376) { label = 111; break; } else { var $psize_1 = $222;label = 113; break; }
  case 111: 
   HEAP32[((((1344)|0))>>2)]=$222;
   label = 140; break;
  case 112: 
   var $379=$194 & -2;
   HEAP32[(($193)>>2)]=$379;
   var $380=$psize_0 | 1;
   var $381=(($p_0+4)|0);
   HEAP32[(($381)>>2)]=$380;
   var $382=(($189+$psize_0)|0);
   var $383=$382;
   HEAP32[(($383)>>2)]=$psize_0;
   var $psize_1 = $psize_0;label = 113; break;
  case 113: 
   var $psize_1;
   var $385=$psize_1 >>> 3;
   var $386=(($psize_1)>>>(0)) < 256;
   if ($386) { label = 114; break; } else { label = 119; break; }
  case 114: 
   var $388=$385 << 1;
   var $389=((1376+($388<<2))|0);
   var $390=$389;
   var $391=HEAP32[((((1336)|0))>>2)];
   var $392=1 << $385;
   var $393=$391 & $392;
   var $394=(($393)|(0))==0;
   if ($394) { label = 115; break; } else { label = 116; break; }
  case 115: 
   var $396=$391 | $392;
   HEAP32[((((1336)|0))>>2)]=$396;
   var $_sum248_pre=((($388)+(2))|0);
   var $_pre=((1376+($_sum248_pre<<2))|0);
   var $F16_0 = $390;var $_pre_phi = $_pre;label = 118; break;
  case 116: 
   var $_sum249=((($388)+(2))|0);
   var $398=((1376+($_sum249<<2))|0);
   var $399=HEAP32[(($398)>>2)];
   var $400=$399;
   var $401=HEAP32[((((1352)|0))>>2)];
   var $402=(($400)>>>(0)) < (($401)>>>(0));
   if ($402) { label = 117; break; } else { var $F16_0 = $399;var $_pre_phi = $398;label = 118; break; }
  case 117: 
   _abort();
   throw "Reached an unreachable!";
  case 118: 
   var $_pre_phi;
   var $F16_0;
   HEAP32[(($_pre_phi)>>2)]=$p_0;
   var $405=(($F16_0+12)|0);
   HEAP32[(($405)>>2)]=$p_0;
   var $406=(($p_0+8)|0);
   HEAP32[(($406)>>2)]=$F16_0;
   var $407=(($p_0+12)|0);
   HEAP32[(($407)>>2)]=$390;
   label = 140; break;
  case 119: 
   var $409=$p_0;
   var $410=$psize_1 >>> 8;
   var $411=(($410)|(0))==0;
   if ($411) { var $I18_0 = 0;label = 122; break; } else { label = 120; break; }
  case 120: 
   var $413=(($psize_1)>>>(0)) > 16777215;
   if ($413) { var $I18_0 = 31;label = 122; break; } else { label = 121; break; }
  case 121: 
   var $415=((($410)+(1048320))|0);
   var $416=$415 >>> 16;
   var $417=$416 & 8;
   var $418=$410 << $417;
   var $419=((($418)+(520192))|0);
   var $420=$419 >>> 16;
   var $421=$420 & 4;
   var $422=$421 | $417;
   var $423=$418 << $421;
   var $424=((($423)+(245760))|0);
   var $425=$424 >>> 16;
   var $426=$425 & 2;
   var $427=$422 | $426;
   var $428=(((14)-($427))|0);
   var $429=$423 << $426;
   var $430=$429 >>> 15;
   var $431=((($428)+($430))|0);
   var $432=$431 << 1;
   var $433=((($431)+(7))|0);
   var $434=$psize_1 >>> (($433)>>>(0));
   var $435=$434 & 1;
   var $436=$435 | $432;
   var $I18_0 = $436;label = 122; break;
  case 122: 
   var $I18_0;
   var $438=((1640+($I18_0<<2))|0);
   var $439=(($p_0+28)|0);
   var $I18_0_c=$I18_0;
   HEAP32[(($439)>>2)]=$I18_0_c;
   var $440=(($p_0+20)|0);
   HEAP32[(($440)>>2)]=0;
   var $441=(($p_0+16)|0);
   HEAP32[(($441)>>2)]=0;
   var $442=HEAP32[((((1340)|0))>>2)];
   var $443=1 << $I18_0;
   var $444=$442 & $443;
   var $445=(($444)|(0))==0;
   if ($445) { label = 123; break; } else { label = 124; break; }
  case 123: 
   var $447=$442 | $443;
   HEAP32[((((1340)|0))>>2)]=$447;
   HEAP32[(($438)>>2)]=$409;
   var $448=(($p_0+24)|0);
   var $_c=$438;
   HEAP32[(($448)>>2)]=$_c;
   var $449=(($p_0+12)|0);
   HEAP32[(($449)>>2)]=$p_0;
   var $450=(($p_0+8)|0);
   HEAP32[(($450)>>2)]=$p_0;
   label = 136; break;
  case 124: 
   var $452=HEAP32[(($438)>>2)];
   var $453=(($I18_0)|(0))==31;
   if ($453) { var $458 = 0;label = 126; break; } else { label = 125; break; }
  case 125: 
   var $455=$I18_0 >>> 1;
   var $456=(((25)-($455))|0);
   var $458 = $456;label = 126; break;
  case 126: 
   var $458;
   var $459=$psize_1 << $458;
   var $K19_0 = $459;var $T_0 = $452;label = 127; break;
  case 127: 
   var $T_0;
   var $K19_0;
   var $461=(($T_0+4)|0);
   var $462=HEAP32[(($461)>>2)];
   var $463=$462 & -8;
   var $464=(($463)|(0))==(($psize_1)|(0));
   if ($464) { label = 132; break; } else { label = 128; break; }
  case 128: 
   var $466=$K19_0 >>> 31;
   var $467=(($T_0+16+($466<<2))|0);
   var $468=HEAP32[(($467)>>2)];
   var $469=(($468)|(0))==0;
   var $470=$K19_0 << 1;
   if ($469) { label = 129; break; } else { var $K19_0 = $470;var $T_0 = $468;label = 127; break; }
  case 129: 
   var $472=$467;
   var $473=HEAP32[((((1352)|0))>>2)];
   var $474=(($472)>>>(0)) < (($473)>>>(0));
   if ($474) { label = 131; break; } else { label = 130; break; }
  case 130: 
   HEAP32[(($467)>>2)]=$409;
   var $476=(($p_0+24)|0);
   var $T_0_c245=$T_0;
   HEAP32[(($476)>>2)]=$T_0_c245;
   var $477=(($p_0+12)|0);
   HEAP32[(($477)>>2)]=$p_0;
   var $478=(($p_0+8)|0);
   HEAP32[(($478)>>2)]=$p_0;
   label = 136; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   var $481=(($T_0+8)|0);
   var $482=HEAP32[(($481)>>2)];
   var $483=$T_0;
   var $484=HEAP32[((((1352)|0))>>2)];
   var $485=(($483)>>>(0)) < (($484)>>>(0));
   if ($485) { label = 135; break; } else { label = 133; break; }
  case 133: 
   var $487=$482;
   var $488=(($487)>>>(0)) < (($484)>>>(0));
   if ($488) { label = 135; break; } else { label = 134; break; }
  case 134: 
   var $490=(($482+12)|0);
   HEAP32[(($490)>>2)]=$409;
   HEAP32[(($481)>>2)]=$409;
   var $491=(($p_0+8)|0);
   var $_c244=$482;
   HEAP32[(($491)>>2)]=$_c244;
   var $492=(($p_0+12)|0);
   var $T_0_c=$T_0;
   HEAP32[(($492)>>2)]=$T_0_c;
   var $493=(($p_0+24)|0);
   HEAP32[(($493)>>2)]=0;
   label = 136; break;
  case 135: 
   _abort();
   throw "Reached an unreachable!";
  case 136: 
   var $495=HEAP32[((((1368)|0))>>2)];
   var $496=((($495)-(1))|0);
   HEAP32[((((1368)|0))>>2)]=$496;
   var $497=(($496)|(0))==0;
   if ($497) { var $sp_0_in_i = ((1792)|0);label = 137; break; } else { label = 140; break; }
  case 137: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $498=(($sp_0_i)|(0))==0;
   var $499=(($sp_0_i+8)|0);
   if ($498) { label = 138; break; } else { var $sp_0_in_i = $499;label = 137; break; }
  case 138: 
   HEAP32[((((1368)|0))>>2)]=-1;
   label = 140; break;
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_free"] = _free;
// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
var calledRun = false;
dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun && shouldRunNow) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
//@ sourceMappingURL=quicksort_anim.js.map