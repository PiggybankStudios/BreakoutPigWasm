

// +--------------------------------------------------------------+
// |                           Defines                            |
// +--------------------------------------------------------------+
var INITIAL_WASM_MEMORY_PAGE_COUNT = 7;
var WASM_FILE_PATH = "MapEditor.wasm"

var ArenaName_MainHeap  = 0;
var ArenaName_TempArena = 1;
var ArenaName_NumNames  = 2;

// +--------------------------------------------------------------+
// |                           Globals                            |
// +--------------------------------------------------------------+
var wasmMemory = null;
var canvasContextGl = null;
var webglObjects = {
	programs: [ null ],
	uniforms: [ null ],
	shaders: [ null ],
	vertBuffers: [ null ],
	vertArrays: [ null ],
	frameBuffers: [ null ],
	textures: [ null ],
}
var wasmModule = null;
var mousePositionX = 0;
var mousePositionY = 0;


const MouseBtn_None    = 0;
const MouseBtn_Left    = 1;
const MouseBtn_Right   = 2;
const MouseBtn_Middle  = 3;
const MouseBtn_NumBtns = 4;

const MouseBtn_Dictionary =
{
	0: MouseBtn_Left,
	1: MouseBtn_Middle,
	2: MouseBtn_Right,
};

function MouseDownEventNumToBtnEnum(btnNum)
{
	if (MouseBtn_Dictionary[btnNum] !== undefined)
	{
		return MouseBtn_Dictionary[btnNum];
	}
	else
	{
		console.log("Unknown btnNum in mouse event: \"" + btnNum + "\"");
		return MouseBtn_NumBtns;
	}
}

const Key_None         = 0;

const Key_A            = 1;
const Key_B            = 2;
const Key_C            = 3;
const Key_D            = 4;
const Key_E            = 5;
const Key_F            = 6;
const Key_G            = 7;
const Key_H            = 8;
const Key_I            = 9;
const Key_J            = 10;
const Key_K            = 11;
const Key_L            = 12;
const Key_M            = 13;
const Key_N            = 14;
const Key_O            = 15;
const Key_P            = 16;
const Key_Q            = 17;
const Key_R            = 18;
const Key_S            = 19;
const Key_T            = 20;
const Key_U            = 21;
const Key_V            = 22;
const Key_W            = 23;
const Key_X            = 24;
const Key_Y            = 25;
const Key_Z            = 26;

const Key_0            = 27;
const Key_1            = 28;
const Key_2            = 29;
const Key_3            = 30;
const Key_4            = 31;
const Key_5            = 32;
const Key_6            = 33;
const Key_7            = 34;
const Key_8            = 35;
const Key_9            = 36;

const Key_Num0         = 37;
const Key_Num1         = 38;
const Key_Num2         = 39;
const Key_Num3         = 40;
const Key_Num4         = 41;
const Key_Num5         = 42;
const Key_Num6         = 43;
const Key_Num7         = 44;
const Key_Num8         = 45;
const Key_Num9         = 46;

const Key_NumPeriod    = 47;
const Key_NumDivide    = 48;
const Key_NumMultiply  = 49;
const Key_NumSubtract  = 50;
const Key_NumAdd       = 51;

const Key_F1           = 52;
const Key_F2           = 53;
const Key_F3           = 54;
const Key_F4           = 55;
const Key_F5           = 56;
const Key_F6           = 57;
const Key_F7           = 58;
const Key_F8           = 59;
const Key_F9           = 60;
const Key_F10          = 61;
const Key_F11          = 62;
const Key_F12          = 63;

const Key_Enter        = 64;
const Key_Backspace    = 65;
const Key_Escape       = 66;
const Key_Insert       = 67;
const Key_Delete       = 68;
const Key_Home         = 69;
const Key_End          = 70;
const Key_PageUp       = 71;
const Key_PageDown     = 72;
const Key_Tab          = 73;
const Key_CapsLock     = 74;
const Key_NumLock      = 75;

const Key_Control      = 76;
const Key_Alt          = 77;
const Key_Shift        = 78;

const Key_Right        = 79;
const Key_Left         = 80;
const Key_Up           = 81;
const Key_Down         = 82;

const Key_Plus         = 83;
const Key_Minus        = 84;
const Key_Pipe         = 85;
const Key_OpenBracket  = 86;
const Key_CloseBracket = 87;
const Key_Colon        = 88;
const Key_Quote        = 89;
const Key_Comma        = 90;
const Key_Period       = 91;
const Key_QuestionMark = 92;
const Key_Tilde        = 93;
const Key_Space        = 94;

const Key_NumKeys      = 95;

const Key_Dictionary =
{
	"Enter":          Key_Enter,
	"NumpadEnter":    Key_Enter,
	"Space":          Key_Space,
	"Backspace":      Key_Backspace,
	"Tab":            Key_Tab,
	"Escape":         Key_Escape,
	"ShiftLeft":      Key_Shift,
	"ShiftRight":     Key_Shift,
	"ControlLeft":    Key_Control,
	"ControlRight":   Key_Control,
	"AltLeft":        Key_Alt,
	"AltRight":       Key_Alt,
	"Backquote":      Key_Tilde,
	"Insert":         Key_Insert,
	"Delete":         Key_Delete,
	"Home":           Key_Home,
	"End":            Key_End,
	"PageUp":         Key_PageUp,
	"PageDown":       Key_PageDown,
	"KeyA":           Key_A,
	"KeyB":           Key_B,
	"KeyC":           Key_C,
	"KeyD":           Key_D,
	"KeyE":           Key_E,
	"KeyF":           Key_F,
	"KeyG":           Key_G,
	"KeyH":           Key_H,
	"KeyI":           Key_I,
	"KeyJ":           Key_J,
	"KeyK":           Key_K,
	"KeyL":           Key_L,
	"KeyM":           Key_M,
	"KeyN":           Key_N,
	"KeyO":           Key_O,
	"KeyP":           Key_P,
	"KeyQ":           Key_Q,
	"KeyR":           Key_R,
	"KeyS":           Key_S,
	"KeyT":           Key_T,
	"KeyU":           Key_U,
	"KeyV":           Key_V,
	"KeyW":           Key_W,
	"KeyX":           Key_X,
	"KeyY":           Key_Y,
	"KeyZ":           Key_Z,
	"Backslash":      Key_Pipe,
	"BracketLeft":    Key_OpenBracket,
	"BracketRight":   Key_CloseBracket,
	"Semicolon":      Key_Colon,
	"Quote":          Key_Quote,
	"Slash":          Key_QuestionMark,
	"Period":         Key_Period,
	"Comma":          Key_Comma,
	"Minus":          Key_Minus,
	"Equal":          Key_Plus,
	"Digit1":         Key_1,
	"Digit2":         Key_2,
	"Digit3":         Key_3,
	"Digit4":         Key_4,
	"Digit5":         Key_5,
	"Digit6":         Key_6,
	"Digit7":         Key_7,
	"Digit8":         Key_8,
	"Digit9":         Key_9,
	"Digit0":         Key_0,
	"Numpad0":        Key_Num0,
	"Numpad1":        Key_Num1,
	"Numpad2":        Key_Num2,
	"Numpad3":        Key_Num3,
	"Numpad4":        Key_Num4,
	"Numpad5":        Key_Num5,
	"Numpad6":        Key_Num6,
	"Numpad7":        Key_Num7,
	"Numpad8":        Key_Num8,
	"Numpad9":        Key_Num9,
	"NumpadDecimal":  Key_NumPeriod,
	"NumpadAdd":      Key_NumAdd,
	"NumpadSubtract": Key_NumSubtract,
	"NumpadMultiply": Key_NumMultiply,
	"NumpadDivide":   Key_NumDivide,
	"F1":             Key_F1,
	"F2":             Key_F2,
	"F3":             Key_F3,
	"F4":             Key_F4,
	"F5":             Key_F5,
	"F6":             Key_F6,
	"F7":             Key_F7,
	"F8":             Key_F8,
	"F9":             Key_F9,
	"F10":            Key_F10,
	"F11":            Key_F11,
	"F12":            Key_F12,
	"NumLock":        Key_NumLock,
	// "ScrollLock":     Key_ScrollLock, //no enum value on our side
	// "Pause":          Key_Pause,      //no enum value on our side
};

function KeyDownEventStrToKeyEnum(keyStr)
{
	if (Key_Dictionary[keyStr] !== undefined)
	{
		return Key_Dictionary[keyStr];
	}
	else
	{
		console.log("Unknown KeyDownEventStr: \"" + keyStr + "\"");
		return Key_NumKeys;
	}
}


async function loadWasmModule(filePath, environment)
{
	// console.log("Loading " + filePath + "...");
	let result = null;
	try
	{
		const fetchPromise = fetch(filePath);
		const wasmModule = await WebAssembly.instantiateStreaming(
			fetchPromise,
			{ env: environment }
		);
		result = wasmModule.instance;
		// console.log("Loaded module exports:", result.exports);
	}
	catch (exception)
	{
		console.error("Failed to load WASM module from \"" + filePath + "\":", exception);
	}
	return result;
}

// +--------------------------------------------------------------+
// |                     Wasm Data Marshaling                     |
// +--------------------------------------------------------------+
function writeToWasmCharBuffer(bufferLength, bufferPntr, stringToWrite)
{
	console.assert(typeof(bufferLength)  == "number", "Invalid type for bufferLength passed to writeToWasmCharBuffer");
	console.assert(typeof(bufferPntr)    == "number", "Invalid type for bufferPntr passed to writeToWasmCharBuffer");
	console.assert(typeof(stringToWrite) == "string", "Invalid type for stringToWrite passed to writeToWasmCharBuffer");
	let encodedStr = new TextEncoder().encode(stringToWrite);
	let buf = new Uint8Array(wasmMemory.buffer);
	for (let cIndex = 0; cIndex < encodedStr.length && cIndex < bufferLength-1; cIndex++)
	{
		buf[bufferPntr + cIndex] = encodedStr[cIndex];
	}
	buf[bufferPntr + Math.min(encodedStr.length, bufferLength-1)] = 0;
}

//TODO: Add support for utf-8 encoding
function wasmPntrToJsString(ptr)
{
	const codes = [];
	const buf = new Uint8Array(wasmMemory.buffer);
	
	let cIndex = 0;
	while (true)
	{
		const char = buf[ptr + cIndex];
		if (!char) { break; }
		codes.push(char);
		cIndex++;
	}
	
	//TODO: Can we do something else? If we do our own UTF-8 parsing maybe?
	return String.fromCharCode(...codes);
}

function jsStringToWasmPntr(arenaName, jsString)
{
	let allocSize = jsString.length+1;
	let result = wasmModule.exports.AllocateMemory(arenaName, allocSize);
	writeToWasmCharBuffer(allocSize, result, jsString);
	WritePntr_U8(result + (allocSize-1), 0x00);
	return result;
}

function freeWasmString(arenaName, stringPntr, stringLength)
{
	wasmModule.exports.FreeMemory(arenaName, stringPntr, stringLength+1);
}

// +--------------------------------------------------------------+
// |               WritePntr and ReadPntr Functions               |
// +--------------------------------------------------------------+
function WritePntr_Bool(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	if (value)
	{
		wasmDataView.setInt8(pntr, 1);
	}
	else
	{
		wasmDataView.setInt8(pntr, 0);
	}
}
function WritePntr_U8(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setUint8(pntr, value);
}
function WritePntr_U16(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setUint16(pntr, value, true);
}
function WritePntr_U32(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setUint32(pntr, value, true);
}
function WritePntr_U64(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setUint64(pntr, value, true);
}
function WritePntr_I8(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setInt8(pntr, value);
}
function WritePntr_I16(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setInt16(pntr, value, true);
}
function WritePntr_I32(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setInt32(pntr, value, true);
}
function WritePntr_I64(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setInt64(pntr, value, true);
}
function WritePntr_R32(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setFloat32(pntr, value, true);
}
function WritePntr_R64(pntr, value)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	wasmDataView.setFloat64(pntr, value, true);
}

function ReadPntr_Bool(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	let intValue = wasmDataView.getUint8(pntr);
	return (intValue != 0);
}
function ReadPntr_U8(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getUint8(pntr);
}
function ReadPntr_U16(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getUint16(pntr, true);
}
function ReadPntr_U32(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getUint32(pntr, true);
}
function ReadPntr_U64(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getUint64(pntr, true);
}
function ReadPntr_I8(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getInt8(pntr);
}
function ReadPntr_I16(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getInt16(pntr, true);
}
function ReadPntr_I32(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getInt32(pntr, true);
}
function ReadPntr_I64(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getInt64(pntr, true);
}
function ReadPntr_R32(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getFloat32(pntr, true);
}
function ReadPntr_R64(pntr)
{
	let wasmDataView = new DataView(wasmMemory.buffer);
	return wasmDataView.getFloat64(pntr, true);
}

// +--------------------------------------------------------------+
// |                        Verify Helpers                        |
// +--------------------------------------------------------------+
function verifyProgramId(programId)
{
	if (typeof(programId) != "number") { return "ProgramId is not a number!"; }
	if (programId == 0) { return "ProgramId is 0!"; }
	if (webglObjects == null || webglObjects.programs == null) { return "Programs array has not been initialized yet!"; }
	if (programId >= webglObjects.programs.length) { return "ProgramId is too high!"; }
	if (webglObjects.programs[programId] == null) { return "ProgramId is for a destroyed program!"; }
	return null;
}
function verifyShaderId(shaderId)
{
	if (typeof(shaderId) != "number") { return "ShaderId is not a number!"; }
	if (shaderId == 0) { return "ShaderId is 0!"; }
	if (webglObjects == null || webglObjects.shaders == null) { return "Shaders array has not been initialized yet!"; }
	if (shaderId >= webglObjects.shaders.length) { return "ShaderId is too high!"; }
	if (webglObjects.shaders[shaderId] == null) { return "ShaderId is for a destroyed shader!"; }
	return null;
}
function verifyUniformLocationId(locationId)
{
	if (typeof(locationId) != "number") { return "UniformLocationId is not a number!"; }
	if (locationId == 0) { return "UniformLocationId is 0!"; }
	if (webglObjects == null || webglObjects.uniforms == null) { return "Uniforms array has not been initialized yet!"; }
	if (locationId >= webglObjects.uniforms.length) { return "UniformLocationId is too high!"; }
	if (webglObjects.uniforms[locationId] == null) { return "UniformLocationId is for a destroyed uniform!"; }
	return null;
}
function verifyVertBufferId(vertBufferId)
{
	if (typeof(vertBufferId) != "number") { return "VertBufferId is not a number!"; }
	if (vertBufferId == 0) { return "VertBufferId is 0!"; }
	if (webglObjects == null || webglObjects.vertBuffers == null) { return "VertBuffers array has not been initialized yet!"; }
	if (vertBufferId >= webglObjects.vertBuffers.length) { return "VertBufferId is too high!"; }
	if (webglObjects.vertBuffers[vertBufferId] == null) { return "VertBufferId is for a destroyed vertBuffer!"; }
	return null;
}
function verifyVertArrayId(vertArrayId)
{
	if (typeof(vertArrayId) != "number") { return "VertArrayId is not a number!"; }
	if (vertArrayId == 0) { return "VertArrayId is 0!"; }
	if (webglObjects == null || webglObjects.vertArrays == null) { return "VertArrays array has not been initialized yet!"; }
	if (vertArrayId >= webglObjects.vertArrays.length) { return "VertArrayId is too high!"; }
	if (webglObjects.vertArrays[vertArrayId] == null) { return "VertArrayId is for a destroyed array!"; }
	return null;
}
function verifyFrameBufferId(frameBufferId)
{
	if (typeof(frameBufferId) != "number") { return "FrameBufferId is not a number!"; }
	if (frameBufferId == 0) { return "FrameBufferId is 0!"; }
	if (webglObjects == null || webglObjects.frameBuffers == null) { return "FrameBuffers array has not been initialized yet!"; }
	if (frameBufferId >= webglObjects.frameBuffers.length) { return "FrameBufferId is too high!"; }
	if (webglObjects.frameBuffers[frameBufferId] == null) { return "FrameBufferId is for a destroyed frameBuffer!"; }
	return null;
}
function verifyTextureId(textureId)
{
	if (typeof(textureId) != "number") { return "TextureId is not a number!"; }
	if (textureId == 0) { return "TextureId is 0!"; }
	if (webglObjects == null || webglObjects.textures == null) { return "Textures array has not been initialized yet!"; }
	if (textureId >= webglObjects.textures.length) { return "TextureId is too high!"; }
	if (webglObjects.textures[textureId] == null) { return "TextureId is for a destroyed texture!"; }
	return null;
}

function verifyParameter(verifyResult, functionName, parameterName, parameterValue)
{
	if (verifyResult == null) { return true; }
	console.error("Invalid argument \"" + parameterName + "\" passed to " + functionName + ": " + verifyResult);
	console.error("Argument value: " + parameterValue);
	return false;
}


// +--------------------------------------------------------------+
// |                          Intrinsics                          |
// +--------------------------------------------------------------+
function js_sinf(value)
{
	return Math.sin(value);
}
function js_cosf(value)
{
	return Math.cos(value);
}
function js_roundf(value)
{
	return Math.round(value);
}
function js_ldexp(value, exponent)
{
	//TODO: Maybe we need to care about inaccuracy here?? Check https://blog.codefrau.net/2014/08/deconstructing-floats-frexp-and-ldexp.html
	return value * Math.pow(2, exponent);
}
function js_pow(base, exponent)
{
	return Math.pow(base, exponent);
}

apiFuncs_intrinsics = {
	sinf:   js_sinf,
	cosf:   js_cosf,
	roundf: js_roundf,
	ldexp:  js_ldexp,
	pow:    js_pow,
};

// +--------------------------------------------------------------+
// |                       Custom Functions                       |
// +--------------------------------------------------------------+
function RequestMoreMemoryPages(numPages)
{
	// console.log("Memory growing by " + numPages + " pages");
	wasmMemory.grow(numPages);
}

function PrintoutStack()
{
	console.trace();
}

function DebugOutput(level, messagePtr)
{
	if (level >= 6) //DbgLevel_Error
	{
		console.error(wasmPntrToJsString(messagePtr));
	}
	else if (level == 5) //DbgLevel_Warn
	{
		console.warn(wasmPntrToJsString(messagePtr));
	}
	else
	{
		var colorString = "";
		if (level == 0) { colorString = "color: #AfAfA2;"; } //DbgLevel_Debug  MonokaiGray1
		if (level == 1) { colorString = "";                } //DbgLevel_Log    Default Color
		if (level == 2) { colorString = "color: #A6E22E;"; } //DbgLevel_Info   MonokaiGreen
		if (level == 3) { colorString = "color: #AE81FF;"; } //DbgLevel_Notify MonokaiPurple
		if (level == 4) { colorString = "color: #66D9EF;"; } //DbgLevel_Other  MonokaiBlue
		console.log("%c" + wasmPntrToJsString(messagePtr), colorString);
	}
}

function GetCanvasSize(widthOutPntr, heightOutPntr)
{
	let pixelRatio = window.devicePixelRatio;
	let canvasWidth = canvas.width / pixelRatio;
	let canvasHeight = canvas.height / pixelRatio;
	// console.log("Canvas size: " + canvasWidth + "x" + canvasHeight + " (ratio " + pixelRatio + ")");
	WritePntr_R32(widthOutPntr, canvasWidth);
	WritePntr_R32(heightOutPntr, canvasHeight);
}

function GetMousePosition(xPosOutPntr, yPosOutPntr)
{
	WritePntr_R32(xPosOutPntr, mousePositionX);
	WritePntr_R32(yPosOutPntr, mousePositionY);
}

function RequestFileAsync(requestId, filePathPntr)
{
	let filePath = wasmPntrToJsString(filePathPntr);
	// console.log("RequestFileAsync(" + requestId + ", " + filePath + ")");
	
	let baseUrl = window.location.origin;
	//TODO: Is there any better way we could do this without hardcoding the repository name here!?
	let isRunningInGithubPages = baseUrl.includes("github.io");
	if (isRunningInGithubPages)
	{
		baseUrl += "/BreakoutPigWasm";
	}
	
	// console.log("base url: \"" + baseUrl + "\"");
	fetch(baseUrl + "/" + filePath, { cache: "no-cache" })
	.then(data => data.blob())
	.then(blob => blob.arrayBuffer())
	.then(resultBuffer =>
	{
		// console.log(resultBuffer);
		let bufferU8 = new Uint8Array(resultBuffer);
		let spacePntr = wasmModule.exports.AllocateMemory(ArenaName_MainHeap, resultBuffer.byteLength);
		// console.log("Allocated at " + spacePntr);
		let buf = new Uint8Array(wasmMemory.buffer);
		for (let bIndex = 0; bIndex < resultBuffer.byteLength; bIndex++)
		{
			buf[spacePntr + bIndex] = bufferU8[bIndex];
		}
		wasmModule.exports.HandleFileReady(requestId, resultBuffer.byteLength, spacePntr);
		wasmModule.exports.FreeMemory(ArenaName_MainHeap, spacePntr, resultBuffer.byteLength);
	});
}

function TestFunction()
{
	return jsStringToWasmPntr(ArenaName_MainHeap, "Hello from Javascript!");
}

apiFuncs_custom = {
	RequestMoreMemoryPages: RequestMoreMemoryPages,
	PrintoutStack: PrintoutStack,
	DebugOutput: DebugOutput,
	GetCanvasSize: GetCanvasSize,
	GetMousePosition: GetMousePosition,
	RequestFileAsync: RequestFileAsync,
	TestFunction: TestFunction,
};

// +--------------------------------------------------------------+
// |                       OpenGL Functions                       |
// +--------------------------------------------------------------+
function glGetError() //returns i32
{
	return canvasContextGl.getError();
}
function glGetBooleanv(pname, params)
{
	var value = canvasContextGl.getParameter(pname);
	WritePntr_Bool(params, value);
}
function glGetShaderiv(shaderId, pname, params)
{
	console.assert(shaderId < webglObjects.shaders.length, "Invalid shader ID passed to glGetShaderiv");
	var value = canvasContextGl.getShaderParameter(webglObjects.shaders[shaderId], pname);
	WritePntr_I32(params, value);
}
function glGetProgramiv(programId, pname, params)
{
	if (!verifyParameter(verifyProgramId(programId), "glGetProgramiv", "programId", programId)) { return; }
	var value = canvasContextGl.getProgramParameter(webglObjects.programs[programId], pname);
	// console.log("Programiv: " + value);
	WritePntr_I32(params, value);
}
function glGetShaderInfoLog(shaderId, maxLength, lengthOutPntr, infoLogPntr)
{
	if (!verifyParameter(verifyShaderId(shaderId), "glGetShaderInfoLog", "shaderId", shaderId)) { return; }
	var logString = canvasContextGl.getShaderInfoLog(webglObjects.shaders[shaderId]);
	if (logString.length > maxLength) { logString = logString.substring(0, maxLength); }
	// console.log("Shader info log:", logString);
	WritePntr_I32(lengthOutPntr, logString.length);
	writeToWasmCharBuffer(maxLength, infoLogPntr, logString);
}
function glGetProgramInfoLog(programId, maxLength, lengthOutPntr, infoLogPntr)
{
	if (!verifyParameter(verifyProgramId(programId), "glGetProgramInfoLog", "programId", programId)) { return; }
	var logString = canvasContextGl.getProgramInfoLog(webglObjects.programs[programId]);
	if (logString.length > maxLength) { logString = logString.substring(0, maxLength); }
	// console.log("Program info log:", logString);
	WritePntr_I32(lengthOutPntr, logString.length);
	writeToWasmCharBuffer(maxLength, infoLogPntr, logString);
}
function glGetAttribLocation(programId, namePntr) //returns GLint
{
	if (!verifyParameter(verifyProgramId(programId), "glGetAttribLocation", "programId", programId)) { return; }
	let result = canvasContextGl.getAttribLocation(webglObjects.programs[programId], wasmPntrToJsString(namePntr));
	return result;
}
function glGetUniformLocation(programId, namePntr) //returns GLint
{
	if (!verifyParameter(verifyProgramId(programId), "glGetUniformLocation", "programId", programId)) { return; }
	let uniformLocationObj = canvasContextGl.getUniformLocation(webglObjects.programs[programId], wasmPntrToJsString(namePntr));
	if (uniformLocationObj != null)
	{
		let locationId = webglObjects.uniforms.length;
		webglObjects.uniforms.push(uniformLocationObj);
		return locationId;
	}
	else
	{
		return -1;
	}
}
function glGetTextureSubImage(texture, level, xoffset, yoffset, zoffset, width, height, depth, format, type, bufSize, pixels)
{
	console.error("glGetTextureSubImage is unimplemented!"); //TODO: Implement me!
}
function glCheckFramebufferStatus(target) //returns GLenum
{
	console.error("glCheckFramebufferStatus is unimplemented!"); //TODO: Implement me!
}
function glEnable(cap)
{
	canvasContextGl.enable(cap);
}
function glDisable(cap)
{
	canvasContextGl.disable(cap);
}
function glBlendFunc(sfactor, dfactor)
{
	canvasContextGl.blendFunc(sfactor, dfactor);
}
function glBlendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha)
{
	canvasContextGl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
}
function glDepthFunc(func)
{
	canvasContextGl.depthFunc(func);
}
function glFrontFace(mode)
{
	canvasContextGl.frontFace(mode);
}
function glGenFramebuffer()
{
	console.error("glGenFramebuffer is unimplemented!"); //TODO: Implement me!
}
function glGenVertexArray()
{
	let vao = canvasContextGl.createVertexArray();
	let vaoId = webglObjects.vertArrays.length;
	webglObjects.vertArrays.push(vao);
	return vaoId;
}
function glGenTexture()
{
	let texture = canvasContextGl.createTexture();
	let textureId = webglObjects.textures.length;
	webglObjects.textures.push(texture);
	return textureId;
}
function glGenBuffer()
{
	let buffer = canvasContextGl.createBuffer();
	let bufferId = webglObjects.vertBuffers.length;
	webglObjects.vertBuffers.push(buffer);
	return bufferId;
}
function glCreateShader(shaderType) //returns GLuint
{
	let shader = canvasContextGl.createShader(shaderType);
	let shaderId = webglObjects.shaders.length;
	webglObjects.shaders.push(shader);
	return shaderId;
}
function glCreateProgram() //returns GLuint
{
	let program = canvasContextGl.createProgram();
	let programId = webglObjects.programs.length;
	webglObjects.programs.push(program);
	return programId;
}
function glDeleteFramebuffer(frameBufferId)
{
	console.error("glDeleteFramebuffer is unimplemented!"); //TODO: Implement me!
}
function glDeleteTexture(textureId)
{
	if (!verifyParameter(verifyTextureId(textureId), "glDeleteTexture", "textureId", textureId)) { return; }
	canvasContextGl.deleteTexture(webglObjects.textures[textureId]);
	webglObjects.textures[textureId] = null;
}
function glDeleteShader(shaderId)
{
	console.assert(shaderId < webglObjects.shaders.length, "Invalid shader ID passed to glDeleteShader");
	canvasContextGl.deleteShader(webglObjects.shaders[shaderId]);
	webglObjects.shaders[shaderId] = null;
}
function glDeleteProgram(programId)
{
	if (!verifyParameter(verifyProgramId(programId), "glDeleteProgram", "programId", programId)) { return; }
	canvasContextGl.deleteProgram(webglObjects.programs[programId]);
	webglObjects.programs[programId] = null;
}
function glDeleteBuffer(bufferId)
{
	if (!verifyParameter(verifyVertBufferId(bufferId), "glDeleteBuffer", "bufferId", bufferId)) { return; }
	canvasContextGl.deleteBuffer(webglObjects.vertBuffers[bufferId]);
	webglObjects.vertBuffers[bufferId] = null;
}
function glBindFramebuffer(target, framebuffer)
{
	console.error("glBindFramebuffer is unimplemented!"); //TODO: Implement me!
}
function glBindVertexArray(vaoId)
{
	if (!verifyParameter(verifyVertArrayId(vaoId), "glBindVertexArray", "vaoId", vaoId)) { return; }
	canvasContextGl.bindVertexArray(webglObjects.vertArrays[vaoId]);
}
function glBindTexture(target, textureId)
{
	if (!verifyParameter(verifyTextureId(textureId), "glBindTexture", "textureId", textureId)) { return; }
	canvasContextGl.bindTexture(target, webglObjects.textures[textureId]);
}
function glBindBuffer(target, bufferId)
{
	if (!verifyParameter(verifyVertBufferId(bufferId), "glBindBuffer", "bufferId", bufferId)) { return; }
	canvasContextGl.bindBuffer(target, webglObjects.vertBuffers[bufferId]);
}
function glUseProgram(programId)
{
	if (!verifyParameter(verifyProgramId(programId), "glUseProgram", "programId", programId)) { return; }
	canvasContextGl.useProgram(webglObjects.programs[programId]);
}
function glTexImage2DMultisample(target, samples, internalformat, width, height, fixedsamplelocations)
{
	console.error("glTexImage2DMultisample is unimplemented!"); //TODO: Implement me!
}
function glTexImage2D(target, level, internalformat, width, height, border, format, type, dataPntr)
{
	//TODO: Do we need a size for Uint8Array
	let dataBuffer = new Uint8Array(wasmMemory.buffer, dataPntr);
	canvasContextGl.texImage2D(target, level, internalformat, width, height, border, format, type, dataBuffer);
}
function glTexParameteri(target, pname, param)
{
	canvasContextGl.texParameteri(target, pname, param);
}
//TODO: Do we actually need this implemented?
function glTexParameteriv(target, pname, params)
{
	console.error("glTexParameteriv is unimplemented!"); //TODO: Implement me!
}
function glEnableVertexAttribArray(index)
{
	canvasContextGl.enableVertexAttribArray(index);
}
function glActiveTexture(textureIndex)
{
	canvasContextGl.activeTexture(textureIndex);
}
function glVertexAttribPointer(index, size, type, normalized, stride, pointer)
{
	canvasContextGl.vertexAttribPointer(index, size, type, normalized, stride, pointer);
}
function glShaderSource(shaderId, string)
{
	console.assert(shaderId < webglObjects.shaders.length, "Invalid shader ID passed to glShaderSource");
	// console.log("Shader source:" + wasmPntrToJsString(string));
	canvasContextGl.shaderSource(webglObjects.shaders[shaderId], wasmPntrToJsString(string));
}
function glCompileShader(shaderId)
{
	console.assert(shaderId < webglObjects.shaders.length, "Invalid shader ID passed to glCompileShader");
	canvasContextGl.compileShader(webglObjects.shaders[shaderId]);
}
function glAttachShader(programId, shaderId)
{
	if (!verifyParameter(verifyProgramId(programId), "glAttachShader", "programId", programId)) { return; }
	console.assert(shaderId < webglObjects.shaders.length, "Invalid shader ID passed to glAttachShader");
	canvasContextGl.attachShader(webglObjects.programs[programId], webglObjects.shaders[shaderId]);
}
function glLinkProgram(programId)
{
	if (!verifyParameter(verifyProgramId(programId), "glLinkProgram", "programId", programId)) { return; }
	canvasContextGl.linkProgram(webglObjects.programs[programId]);
}
function glGenerateMipmap(target)
{
	canvasContextGl.generateMipmap(target);
}
function glBufferData(target, size, dataPntr, usage)
{
	let dataBuf = new Uint8Array(wasmMemory.buffer, dataPntr, size);
	canvasContextGl.bufferData(target, dataBuf, usage, 0);
}
function glBufferSubData(target, offset, size, data)
{
	console.error("glBufferSubData is unimplemented!"); //TODO: Implement me!
}
function glRenderbufferStorageMultisample(target, samples, internalformat, width, height)
{
	console.error("glRenderbufferStorageMultisample is unimplemented!"); //TODO: Implement me!
}
function glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer)
{
	console.error("glFramebufferRenderbuffer is unimplemented!"); //TODO: Implement me!
}
function glFramebufferTexture2D(target, attachment, textarget, texture, level)
{
	console.error("glFramebufferTexture2D is unimplemented!"); //TODO: Implement me!
}
function glUniform1i(locationId, v0)
{
	if (!verifyParameter(verifyUniformLocationId(locationId), "glUniform1i", "locationId", locationId)) { return; }
	canvasContextGl.uniform1i(webglObjects.uniforms[locationId], v0);
}
function glUniform1f(locationId, v0)
{
	if (!verifyParameter(verifyUniformLocationId(locationId), "glUniform1f", "locationId", locationId)) { return; }
	canvasContextGl.uniform1f(webglObjects.uniforms[locationId], v0);
}
function glUniform2f(locationId, v0, v1)
{
	if (!verifyParameter(verifyUniformLocationId(locationId), "glUniform2f", "locationId", locationId)) { return; }
	canvasContextGl.uniform2f(webglObjects.uniforms[locationId], v0, v1);
}
function glUniform3f(locationId, v0, v1, v2)
{
	if (!verifyParameter(verifyUniformLocationId(locationId), "glUniform3f", "locationId", locationId)) { return; }
	canvasContextGl.uniform3f(webglObjects.uniforms[locationId], v0, v1, v2);
}
function glUniform4f(locationId, v0, v1, v2, v3)
{
	if (!verifyParameter(verifyUniformLocationId(locationId), "glUniform4f", "locationId", locationId)) { return; }
	canvasContextGl.uniform4f(webglObjects.uniforms[locationId], v0, v1, v2, v3);
}
function glUniformMatrix4fv(locationId, count, transpose, valuePntr)
{
	if (!verifyParameter(verifyUniformLocationId(locationId), "glUniformMatrix4fv", "locationId", locationId)) { return; }
	let matrixArray = new Float32Array(wasmMemory.buffer, valuePntr, count * (4 * 4)); //4 * 4 for 4x4 size matrix
	canvasContextGl.uniformMatrix4fv(webglObjects.uniforms[locationId], transpose, matrixArray);
}
function glViewport(x, y, width, height)
{
	canvasContextGl.viewport(x, y, width, height);
}
function glClearColor(red, green, blue, alpha)
{
	canvasContextGl.clearColor(red, green, blue, alpha);
}
function glClearDepth(depth)
{
	canvasContextGl.clearDepth(depth);
}
function glClearStencil(s)
{
	canvasContextGl.clearStencil(s);
}
function glClear(mask)
{
	canvasContextGl.clear(mask);
}
function glDrawArrays(mode, first, count)
{
	canvasContextGl.drawArrays(mode, first, count);
}
function glDrawBuffers(n, bufs)
{
	let buffers = [];
	for (let bIndex = 0; bIndex < n; bIndex++)
	{
		buffers.push(ReadPntr_U32(bufs + bIndex*4));
	}
	canvasContextGl.drawBuffers(buffers);
}

apiFuncs_opengl = {
	glGetError:                       glGetError,
	glGetBooleanv:                    glGetBooleanv,
	glGetShaderiv:                    glGetShaderiv,
	glGetProgramiv:                   glGetProgramiv,
	glGetShaderInfoLog:               glGetShaderInfoLog,
	glGetProgramInfoLog:              glGetProgramInfoLog,
	glGetAttribLocation:              glGetAttribLocation,
	glGetUniformLocation:             glGetUniformLocation,
	glGetTextureSubImage:             glGetTextureSubImage,
	glCheckFramebufferStatus:         glCheckFramebufferStatus,
	glEnable:                         glEnable,
	glDisable:                        glDisable,
	glBlendFunc:                      glBlendFunc,
	glBlendFuncSeparate:              glBlendFuncSeparate,
	glDepthFunc:                      glDepthFunc,
	glFrontFace:                      glFrontFace,
	glGenFramebuffer:                 glGenFramebuffer,
	glGenVertexArray:                 glGenVertexArray,
	glGenTexture:                     glGenTexture,
	glGenBuffer:                      glGenBuffer,
	glCreateShader:                   glCreateShader,
	glCreateProgram:                  glCreateProgram,
	glDeleteFramebuffer:              glDeleteFramebuffer,
	glDeleteTexture:                  glDeleteTexture,
	glDeleteShader:                   glDeleteShader,
	glDeleteProgram:                  glDeleteProgram,
	glDeleteBuffer:                   glDeleteBuffer,
	glBindFramebuffer:                glBindFramebuffer,
	glBindVertexArray:                glBindVertexArray,
	glBindTexture:                    glBindTexture,
	glBindBuffer:                     glBindBuffer,
	glUseProgram:                     glUseProgram,
	glTexImage2DMultisample:          glTexImage2DMultisample,
	glTexImage2D:                     glTexImage2D,
	glTexParameteri:                  glTexParameteri,
	glTexParameteriv:                 glTexParameteriv,
	glEnableVertexAttribArray:        glEnableVertexAttribArray,
	glActiveTexture:                  glActiveTexture,
	glVertexAttribPointer:            glVertexAttribPointer,
	glShaderSource:                   glShaderSource,
	glCompileShader:                  glCompileShader,
	glAttachShader:                   glAttachShader,
	glLinkProgram:                    glLinkProgram,
	glGenerateMipmap:                 glGenerateMipmap,
	glBufferData:                     glBufferData,
	glBufferSubData:                  glBufferSubData,
	glRenderbufferStorageMultisample: glRenderbufferStorageMultisample,
	glFramebufferRenderbuffer:        glFramebufferRenderbuffer,
	glFramebufferTexture2D:           glFramebufferTexture2D,
	glUniform1i:                      glUniform1i,
	glUniform1f:                      glUniform1f,
	glUniform2f:                      glUniform2f,
	glUniform3f:                      glUniform3f,
	glUniform4f:                      glUniform4f,
	glUniformMatrix4fv:               glUniformMatrix4fv,
	glViewport:                       glViewport,
	glClearColor:                     glClearColor,
	glClearDepth:                     glClearDepth,
	glClearStencil:                   glClearStencil,
	glClear:                          glClear,
	glDrawArrays:                     glDrawArrays,
	glDrawBuffers:                    glDrawBuffers,
};


async function initialize()
{
	canvas = document.getElementsByTagName("canvas")[0];
	canvasContainer = document.getElementById("canvas_container");
	console.assert(canvas != null, "Couldn't find canvas DOM element!");
	console.assert(canvasContainer != null, "Couldn't find canvas container DOM element!");
	
	canvasContextGl = canvas.getContext("webgl2");
	if (canvasContextGl === null) { console.error("Unable to initialize WebGL render context. Your browser or machine may not support it :("); return; }
	// console.log(canvasContextGl);
	
	wasmMemory = new WebAssembly.Memory({ initial: INITIAL_WASM_MEMORY_PAGE_COUNT });
	let wasmEnvironment =
	{
		memory: wasmMemory,
		...apiFuncs_intrinsics,
		...apiFuncs_custom,
		...apiFuncs_opengl,
	};
	
	// console.log("Before loading wasm module we have " + wasmMemory.buffer.byteLength);
	wasmModule = await loadWasmModule(WASM_FILE_PATH, wasmEnvironment);
	// console.log("After loading wasm module we now have " + wasmMemory.buffer.byteLength);
	// console.log("WasmModule:", wasmModule);
	
	let initializeTimestamp = Math.floor(Date.now() / 1000); //TODO: Should we be worried about this being a 32-bit float?
	wasmModule.exports.Initialize(INITIAL_WASM_MEMORY_PAGE_COUNT, initializeTimestamp);
	
	window.addEventListener("mousemove", function(event)
	{
		let clientBounds = canvas.getBoundingClientRect();
		mousePositionX = Math.round(event.clientX - clientBounds.left);
		mousePositionY = Math.round(event.clientY - clientBounds.top);
	});
	window.addEventListener("keydown", function(event)
	{
		let key = KeyDownEventStrToKeyEnum(event.code);
		wasmModule.exports.HandleKeyPressOrRelease(key, true);
	});
	window.addEventListener("keyup", function(event)
	{
		let key = KeyDownEventStrToKeyEnum(event.code);
		wasmModule.exports.HandleKeyPressOrRelease(key, false);
	});
	window.addEventListener("mousedown", function(event)
	{
		let mouseBtn = MouseDownEventNumToBtnEnum(event.button);
		wasmModule.exports.HandleMousePressOrRelease(mouseBtn, true);
	});
	window.addEventListener("mouseup", function(event)
	{
		let mouseBtn = MouseDownEventNumToBtnEnum(event.button);
		wasmModule.exports.HandleMousePressOrRelease(mouseBtn, false);
	});
	
	wasmModule.exports.UpdateAndRender(0);
	
	function renderFrame()
	{
		wasmModule.exports.UpdateAndRender(16.6666);
		window.requestAnimationFrame(renderFrame);
	}
	window.requestAnimationFrame(renderFrame);
}

initialize();