using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

public class WebGLMicStream : MonoBehaviour
{
    [Header("Settings")]
    public bool createSoundSource = false;
    public float volume = 1.0f;
    public int sampleRate = 44100;
    public int bufferSize = 256;

    [Header("Components")]
    public  WebGLAudioSource source;

    // Required Functs
    #if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern void InitializeMicrophone(string name, float[] p1, float[] p2, int size, int rate);
        [DllImport("__Internal")]
        private static extern bool MuteMicrophone();
    #endif

    [Header("Debug")]
    public bool isMuted = false;

    // Private
    #pragma warning disable 0414
    private bool muted = false;
    private float[][] buffers;
    private int currentBuffer = 0;
    #pragma warning restore 0414
    void Start()
    {
        if (createSoundSource) source = gameObject.AddComponent<WebGLAudioSource>();
        StartMic();
    }

    public void StartMic() {
        string name = gameObject.name;
        #if UNITY_WEBGL && !UNITY_EDITOR
            buffers = new float[2][];
            buffers[0] = new float[bufferSize];
            buffers[1] = new float[bufferSize];

            InitializeMicrophone(name + "", buffers[0], buffers[1], bufferSize, sampleRate);
        #endif
    }

    public void Mute() {
        #if UNITY_WEBGL && !UNITY_EDITOR
            muted = MuteMicrophone();
            isMuted = muted;
        #endif
    }
    public void UpdateBuffer() {
        if (muted) return;
        
        float[] data = new float[bufferSize];
        for (int i = 0; i < bufferSize; i++) {
            data[i] = buffers[currentBuffer][i] * volume;
        }
        // Can also be a class that extends source, e.g. "Push" also sends data via WS
        source.Push(data);
        // Alternate buffers
        currentBuffer = 1 - currentBuffer;
    }

}
