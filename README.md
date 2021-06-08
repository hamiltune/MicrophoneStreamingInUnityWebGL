# Microphone Streaming In Unity WebGL

A brand new possibility for streaming Microphone Audio in Unity WebGL Applications!

As we know, neither AudioClip streaming nor multi-threading are available to use in Unity WebGL. Alas, we have developed a temporary solution that relies on JavaScript. I introduce to you MicrophoneStreamingInWebGL, a package that will allow you to stream your microphone from your browser to the Unity instance.

# How it Works

The high-level goal of this plugin is to use a JavaScript audio context to handle Microphone streaming in WebGL instances. Since the streams cannot be put into AudioClips (without some serious latency) there must also be source and listeners to playback the stream differently than Unity's Audio Clips.

There are three primary scripts to use in the Unity editor, the WebGL microphone streaming script, the WebGL audio source script and the WebGL audio listener script. Here is a meh diagram demonstrating how it works:


  Browser Environment    |    Unity Environment
  
-------------------------+------------------------------

+----------------+   float[]  +--------------------+

| WebGLMicStream | ---------> | WebGL Audio Source |

+----------------+            +--------------------+

                                        |
                                        
                                        |
                                        
                                        v
                                        
+--------------------+ float[] +----------------------+

| WebGLAudioListener | <------ | WebGL Audio Listener |

+--------------------+         +----------------------+



The microphone data is processed with an AudioWorklet node and chunks of a fixed buffer size are sent into Unity. The general strategy is to Enqueue/Dequeue buffers while keeping in mind latency (framerate). The "destination" is a JavaScript AudioContext that creates AudioBuffers of fixed sizes and schedules them. 

# To Use

1. Add the WebGLMicStream Component to the object of choice (Generally Player)
2. Either check the "Create Source" checkbox in the editor on the WebGLMicStream Component or Add a WebGLAudioSource Component to an object.
3. Place the WebGLAudioListener component the object who is "listening" i.e. (Camera)
4. Play with settings (test with latency and buffer sizes)
