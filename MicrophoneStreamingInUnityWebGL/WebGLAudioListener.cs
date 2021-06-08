using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WebGLAudio;
using System.Runtime.InteropServices;

public class WebGLAudioListener : MonoBehaviour
{
    [Header("Settings")]
    public int sampleRate = 44100;
    public int bufferSize = 256;
    public int latencyInMS = 300;
    public float volume = 1.0f;

    [Header("Debug")]
    public int listenerId = 0;  
    public bool isMuted = false;
    #pragma warning disable 0414
    private bool muted = false;
    #pragma warning restore 0414

    #if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern int InitializeWebGLListener(int size, int rate, int latency, int id);
        [DllImport("__Internal")]
        private static extern bool PushToAudioListener(float[] buffer, float pan, int id);
        [DllImport("__Internal")]
        private static extern bool MuteAudioListener(int id);
    #endif
    void Start()
    {
        listenerId = gameObject.GetInstanceID();

        WebGLAudio.WebGLAudio.listeners.Add(this);
        
        #if UNITY_WEBGL && !UNITY_EDITOR
            InitializeWebGLListener(bufferSize, sampleRate, latencyInMS, listenerId);
        #else
            muted = true;
        #endif
    }

    public void PushToDestination(float[] data, Vector3 src, float spatialBlend) {
        #if UNITY_WEBGL && !UNITY_EDITOR

            if (muted) return;

            float pan = 0.0f;

            // float pan, dist, vol, tmp, rot, otherBlend, x;

            // otherBlend = 1 - spatialBlend;
            // spatialBlend *= volume;
            // otherBlend *= volume;

            // Quaternion t = transform.rotation;
            // transform.LookAt(src, Vector3.up);
            // rot = Quaternion.Angle(t, transform.rotation);
            // transform.rotation = t;

            // Vector3 side = Vector3.Cross(Vector3.up, new Vector3(0, rot, 0)).normalized;
            // x = Vector3.Dot(src - transform.position, side);

            // pan = Mathf.Clamp(x / 30f, -1, 1);
            
            // dist = (src - transform.position).magnitude;
            // vol = 1f / dist;

            // for (int i = 0; i < bufferSize; i++) {
            //     tmp = data[i];
            //     data[i] = spatialBlend * tmp * vol + otherBlend * tmp;
            // }

            PushToAudioListener(data, pan, listenerId);

        #endif
    }

    public void Mute() {
        #if UNITY_WEBGL && !UNITY_EDITOR
            muted = MuteAudioListener(listenerId);
            isMuted = muted;
        #endif
    }
}
