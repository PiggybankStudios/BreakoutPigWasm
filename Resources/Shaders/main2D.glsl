#version 300 es
precision highp float;

uniform mat4 WorldMatrix;
uniform mat4 ViewMatrix;
uniform mat4 ProjectionMatrix;

uniform vec2 Texture1Size;
uniform vec4 SourceRec1;

// layout(location = 0) 
in vec2 inPosition;
in vec4 inColor;
in vec2 inTexCoord;

out vec4 fColor;
out vec2 fTexCoord;
out vec2 fPosition;
out vec2 fSampleCoord;

void main()
{
	fPosition = inPosition;
	fColor = inColor;
	fTexCoord = inTexCoord;
	fSampleCoord = (SourceRec1.xy + (inTexCoord * SourceRec1.zw)) / Texture1Size;
	mat4 transformMatrix = ProjectionMatrix * (ViewMatrix * WorldMatrix);
	gl_Position = transformMatrix * vec4(inPosition, 0.0, 1.0);
}

//======================== FRAGMENT_SHADER ========================
#version 300 es
precision highp float;

uniform sampler2D Texture1;
uniform vec2 Texture1Size;

uniform vec4 Color1;

in vec4 fColor;
in vec2 fTexCoord;
in vec2 fPosition;
in vec2 fSampleCoord;

out vec4 Result;

void main()
{
	vec4 sampleColor = texture(Texture1, fSampleCoord);
	Result = Color1 * sampleColor;
	// if (Result.a < 0.02) { discard; }
}