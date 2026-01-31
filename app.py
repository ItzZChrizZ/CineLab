import streamlit as st
import google.generativeai as genai
import json
import os

# --- 1. SETUP ---
st.set_page_config(page_title="CineLab PRO", layout="wide", page_icon="🎬")

def load_lib():
    path = os.path.join(os.path.dirname(__file__), 'data', 'library.json')
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        st.error("library.json bulunamadı! Lütfen /data/ yolunu kontrol et.")
        return {}

lib = load_lib()

import google.generativeai as genai



genai.configure(api_key=my_api_key)

# --- 2. THEME & COMPACT CSS ---
st.markdown("""
<style>
    .block-container { padding-top: 1.2rem !important; padding-bottom: 0rem !important; }
    .stApp { background-color: #222121; color: #F9FEFF; }
    .compact-bar {
        color: #CCD4D7; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; 
        font-size: 1rem; border-left: 5px solid #238636; padding-left: 12px; margin-bottom: 20px;
    }
    h3 { border-bottom: 1px solid #30363d; padding-bottom: 2px; color: #CCD4D7 !important; text-transform: uppercase; font-size: 0.85rem; margin-top: 10px !important; }
    .info-box { background-color: #161b22; border: 1px solid #30363d; padding: 8px; border-radius: 4px; font-size: 0.72rem; color: #a3a3a3; margin-top: 2px; line-height: 1.4; }
    .stSlider { margin-bottom: -15px !important; }
    .stButton > button { background-color: #238636; color: white; font-weight: 800; width: 100%; text-transform: uppercase; height: 3em; margin-top: 25px; border: none; }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="compact-bar">CINELAB PRO <span style="font-size:0.5rem; opacity:0.5; font-weight:300;">| STUDIO MANAGEMENT v3.3</span></div>', unsafe_allow_html=True)

# --- 3. THE "DP LOGIC" ENGINE ---
def run_cine_engine(params, img_data):
    safety = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
    ]
    
    if params['category'] == "Studio":
        location_logic = """
        LOCATION SWITCH: 100% EMPTY STUDIO. 
        - REMOVE the reference image background completely.
        - Use a neutral, minimalist, empty CYCLORAMA WALL as the background.
        - Ensure the subject remains centered and in the same pose.
        """
    else:
        location_logic = "LOCATION KEEP: Maintain the exact outdoor environment and location from the reference image."

    dp_instructions = f"""
    ROLE: Professional Director of Photography (DP).
    OBJECTIVE: Create a '4x4' (Dört Dörtlük) FLAWLESS and comprehensive cinematography recipe.

    PHASE 1: SUBJECT RETENTION & GENDER LOCK (80% Weight)
    - **GENDER LOCK**: You MUST maintain the exact GENDER and IDENTITY of the person in the reference image. If it's a woman, keep her as a woman. Do not change sex based on clothing style.
    - Perform a '4x4' analysis: Describe the subject in 4 categories (Anatomy, Pose, Outfit, Identity) with 4 high-fidelity descriptors each.
    - Recreate the subject's exact facial features, skin tone, and clothing with absolute precision.
    - {location_logic}

    PHASE 2: TECHNICAL OVERRIDE (Mandatory)
    - Body: {params['cam']} -> {params['cam_info']}
    - Lens: {params['lens']} -> {params['lens_info']}
    - Aperture: {params['f_stop']} | ISO: {params['iso']} | Ratio: {params['ratio']}
    - Apply the specific optical character and sensor DNA of this equipment. Discard metadata from the source image.

    PHASE 3: ARTISTIC DNA (20% Weight)
    - Artist: '{params['artist']}'. Infuse their specific color science, film grain, and texture.

    PHASE 4: LIGHTING PHYSICS
    - Setup: {params['scenario']}
    - Precise Physical Specs: {params['light_details']}
    - Director's Notes: {params['notes']}
    
    OUTPUT: Provide ONLY raw, valid JSON.
    """
    
    model = genai.GenerativeModel("gemini-3-flash-preview", 
                                  system_instruction="Act as a technical Director of Photography. Focus on light physics and professional cinematography.")
    
    res = model.generate_content([dp_instructions, img_data], 
                                  generation_config={"response_mime_type": "application/json", "temperature": 0.1}, 
                                  safety_settings=safety)
    return res.text

# --- 4. UI LAYOUT ---
c1, c2, c3 = st.columns([0.9, 1.2, 1.2])

with c1:
    st.markdown("### REFERENCE")
    up = st.file_uploader("Upload Image", type=['jpg','png','jpeg'], label_visibility="collapsed")
    if up: st.image(up, use_container_width=True)

with c2:
    st.markdown("### EQUIPMENT")
    cam_list = sorted(lib['cameras'].keys()) if lib else []
    cam = st.selectbox("Body", cam_list, label_visibility="collapsed")
    if lib:
        st.markdown(f"<div class='info-box'>{lib['cameras'][cam]['info']} | {lib['cameras'][cam]['vibe']}</div>", unsafe_allow_html=True)
    
    lens_list = sorted(lib['lenses'].keys()) if lib else []
    lens = st.selectbox("Lens", lens_list, label_visibility="collapsed")
    if lib:
        st.markdown(f"<div class='info-box'>{lib['lenses'][lens]['info']} | {lib['lenses'][lens]['character']}</div>", unsafe_allow_html=True)
    
    sc1, sc2 = st.columns(2)
    with sc1:
        f_stop = st.select_slider("F-Stop", options=["f/1.2", "f/1.4", "f/1.8", "f/2.0", "f/2.8", "f/4", "f/5.6", "f/8", "f/11", "f/16", "f/22"])
    with sc2:
        iso = st.select_slider("ISO", options=["50", "100", "200", "400", "800", "1600", "3200", "6400", "Grainy"])

    st.markdown("### ART DIRECTION")
    if lib:
        genre = st.selectbox("Genre", sorted(lib['photographers'].keys()))
        artist = st.selectbox("Artist", sorted(lib['photographers'][genre].keys()))
        inf = lib['photographers'][genre][artist]
        st.markdown(f"<div class='info-box'><b>Artist Style:</b> {inf['style']}<br><b>Light Style:</b> {inf['lighting']}</div>", unsafe_allow_html=True)
    
    notes = st.text_input("Director's Notes", placeholder="Mood, skin details, textures...", key="notes_input")

with c3:
    st.markdown("### LIGHTING")
    l_type = st.radio("Category", ["Studio", "Outdoor"], horizontal=True, label_visibility="collapsed")
    
    selected_p = ""
    if lib:
        presets = sorted(lib['lighting_presets'][l_type].keys())
        selected_p = st.selectbox("Scenario", presets, label_visibility="collapsed")
        st.markdown(f"<div class='info-box'>{lib['lighting_presets'][l_type][selected_p]['info']} | Result: {lib['lighting_presets'][l_type][selected_p]['result']}</div>", unsafe_allow_html=True)

    light_specs = ""
    # --- LOW KEY LOGIC ---
    if selected_p == "Low Key Lighting":
        st.markdown("---")
        is_std_lk = st.checkbox("Standard Low Key", value=True)
        if not is_std_lk:
            with st.expander("🎛️ LOW KEY LIGHT CONTROL", expanded=True):
                darkness = st.slider("Darkness (%)", 0, 100, 80)
                l1c1, l1c2 = st.columns(2)
                with l1c1:
                    p = st.slider("Pan (Sol/Sağ)", -180, 180, 0, key="lkp")
                    t = st.slider("Tilt (D-U)", -90, 90, 45, key="lkt")
                with l1c2:
                    cl = st.color_picker("Color", "#FFFFFF", key="lkc")
                    it = st.slider("Power", 0, 100, 80, key="lki")
                light_specs = f"Low Key Mode ({darkness}% darkness). L1: {cl}, {it}% power at Pan:{p}°, Tilt:{t}°"
        else: light_specs = "Standard Low Key Setup."
            
    # --- CUSTOM STUDIO LOGIC (YENİLENMİŞ) ---
    elif selected_p == "Custom Studio Lights":
        st.markdown("---")
        is_std_custom = st.checkbox("Standard Setup", value=True, key="std_custom_check")
        if not is_std_custom:
            with st.expander("🎛️ CUSTOM STUDIO LIGHT CONTROL", expanded=True):
                n_l = st.radio("Active Lights", [1, 2, 3], horizontal=True, key="std_num")
                parts = []
                for i in range(1, n_l + 1):
                    st.markdown(f"**L{i} Settings**")
                    sl1, sl2 = st.columns(2)
                    with sl1: 
                        p_val = st.slider(f"Pan {i}", -180, 180, 0, key=f"sp{i}")
                        t_val = st.slider(f"Tilt {i}", -90, 90, 45, key=f"st_t{i}")
                    with sl2: 
                        cl_val = st.color_picker(f"Color {i}", "#FFFFFF", key=f"sc{i}")
                        it_val = st.slider(f"Power {i}", 0, 100, 80, key=f"si{i}")
                    parts.append(f"L{i}: {cl_val} {it_val}% power at Pan:{p_val}°, Tilt:{t_val}°")
                light_specs = " | ".join(parts)
        else:
            light_specs = "Standard Balanced 3-Point Studio Setup."
            
    else: 
        light_specs = f"Preset: {selected_p}."

    ratio = st.radio("Ratio", ["4:5", "16:9", "1:1", "9:16"], horizontal=True)

    if st.button("🚀 GENERATE JSON RECIPE"):
        if up:
            with st.spinner("3.0 Flash: Analyzing Reference with 4x4 Logic..."):
                try:
                    params = {
                        "cam": cam, 
                        "cam_info": f"{lib['cameras'][cam]['info']} | {lib['cameras'][cam]['vibe']}",
                        "lens": lens, 
                        "lens_info": f"{lib['lenses'][lens]['info']} | {lib['lenses'][lens]['character']}",
                        "f_stop": f_stop, "iso": iso, "ratio": ratio,
                        "artist": artist, "category": l_type, "scenario": selected_p,
                        "light_details": light_specs, "notes": notes
                    }
                    img_data = {"mime_type": up.type, "data": up.getvalue()}
                    st.session_state.res = run_cine_engine(params, img_data)
                except Exception as e: st.error(f"Error: {e}")

if 'res' in st.session_state:
    st.code(st.session_state.res, language="json")
