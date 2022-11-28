

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

function jsStringToWasmPntr(engine, jsString)
{
	let allocSize = jsString.length+1;
	let result = engine.exports.AllocWasmMemory(allocSize);
	if (result != 0)
	{
		let buf = new Uint8Array(wasmMemory.buffer);
		for (var cIndex = 0; cIndex < jsString.length; cIndex++)
		{
			buf[result + cIndex] = jsString[cIndex];
		}
		buf[result + jsString.length] = '\0';
	}
	return result;
}

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

apiFuncs_intrinsics = {
	sinf: js_sinf,
	cosf: js_cosf,
	roundf: js_roundf,
};

// +--------------------------------------------------------------+
// |                       Custom Functions                       |
// +--------------------------------------------------------------+
function RequestMoreMemoryPages(numPages)
{
	console.log("Memory growing by " + numPages + " pages");
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

function TestFunction()
{
	// writeToWasmCharBuffer(bufferLength, bufferPntr, "Hello WASM!");
	fetch("http://localhost:8000/Resources/icon16.png") //, { cache: "no-cache" }
	.then(data => {
		let blob = data.blob();
		console.log(blob);
		let spacePntr = wasmModule.exports.AllocateMemory(blob.size, ArenaName_MainHeap);
		console.log("Allocated at " + spacePntr);
	});
}

apiFuncs_custom = {
	RequestMoreMemoryPages: RequestMoreMemoryPages,
	PrintoutStack: PrintoutStack,
	DebugOutput: DebugOutput,
	GetCanvasSize: GetCanvasSize,
	GetMousePosition: GetMousePosition,
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
	console.error("glBlendFunc is unimplemented!"); //TODO: Implement me!
}
function glBlendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha)
{
	console.error("glBlendFuncSeparate is unimplemented!"); //TODO: Implement me!
}
function glDepthFunc(func)
{
	console.error("glDepthFunc is unimplemented!"); //TODO: Implement me!
}
function glAlphaFunc(func, ref)
{
	console.error("glAlphaFunc is unimplemented!"); //TODO: Implement me!
}
function glFrontFace(mode)
{
	console.error("glFrontFace is unimplemented!"); //TODO: Implement me!
}
function glLineWidth(width)
{
	console.error("glLineWidth is unimplemented!"); //TODO: Implement me!
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
	console.error("glGenTexture is unimplemented!"); //TODO: Implement me!
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
	console.error("glDeleteTexture is unimplemented!"); //TODO: Implement me!
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
function glBindTexture(target, texture)
{
	console.error("glBindTexture is unimplemented!"); //TODO: Implement me!
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
function glTexImage2D(target, level, internalformat, width, height, border, format, type, data)
{
	console.error("glTexImage2D is unimplemented!"); //TODO: Implement me!
}
function glTexParameteri(target, pname, param)
{
	console.error("glTexParameteri is unimplemented!"); //TODO: Implement me!
}
function glTexParameteriv(target, pname, params)
{
	console.error("glTexParameteriv is unimplemented!"); //TODO: Implement me!
}
function glEnableVertexAttribArray(index)
{
	canvasContextGl.enableVertexAttribArray(index);
}
function glActiveTexture(texture)
{
	console.error("glActiveTexture is unimplemented!"); //TODO: Implement me!
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
	console.error("glGenerateMipmap is unimplemented!"); //TODO: Implement me!
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
	glAlphaFunc:                      glAlphaFunc,
	glFrontFace:                      glFrontFace,
	glLineWidth:                      glLineWidth,
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
	canvas.addEventListener("mousemove", function(event)
	{
		let clientBounds = canvas.getBoundingClientRect();
		mousePositionX = Math.round(event.clientX - clientBounds.left);
		mousePositionY = Math.round(event.clientY - clientBounds.top);
	});
	
	wasmMemory = new WebAssembly.Memory({ initial: INITIAL_WASM_MEMORY_PAGE_COUNT });
	let wasmEnvironment =
	{
		memory: wasmMemory,
		...apiFuncs_intrinsics,
		...apiFuncs_custom,
		...apiFuncs_opengl,
	};
	
	wasmModule = await loadWasmModule(WASM_FILE_PATH, wasmEnvironment);
	// console.log("WasmModule:", wasmModule);
	
	let initializeTimestamp = Math.floor(Date.now() / 1000); //TODO: Should we be worried about this being a 32-bit float?
	wasmModule.exports.Initialize(INITIAL_WASM_MEMORY_PAGE_COUNT, initializeTimestamp);
	
	window.addEventListener("keydown", function(event)
	{
		if (event.key == " ")
		{
			wasmModule.exports.HandleKeyPress(0);
		}
		else if (event.key == "r")
		{
			wasmModule.exports.HandleKeyPress(1);
		}
		else
		{
			// console.warn("Unknown key name \"" + event.key + "\"");
		}
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