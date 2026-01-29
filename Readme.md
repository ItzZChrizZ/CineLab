🎬 CineLab PRO
Studio Management & AI Cinematography Engine v3.3
CineLab PRO is a professional-grade Director of Photography (DP) simulation tool designed to deconstruct reference images and reconstruct them into flawless cinematography recipes. Powered by Gemini 3.0 Flash Preview, the system translates artistic intent into technical JSON data.

🚀 Key Features
1. The "4x4" Analysis Engine
A comprehensive deconstruction logic that ensures every visual detail is captured. It analyzes the reference image across 4 core categories with 4 high-fidelity descriptors each:

Anatomy: Physical structure and features.

Pose: Exact orientation and body language.

Outfit: Precise textures and clothing layers.

Identity: Maintaining the essence of the subject.

2. Gender Lock & Identity Retention
Integrated safety protocols to prevent AI "hallucinations." The Gender Lock ensures that the subject's gender and identity remain immutable, regardless of clothing style or lighting changes.

3. Optical Physics Simulation
CineLab doesn't just describe images; it simulates real-world gear:

Camera Bodies: High-dynamic-range sensors (e.g., Alexa 35, Canon 5D Mark IV).

Lenses: Prime lens characteristics, bokeh quality, and focal length compression (35mm, 50mm, 85mm).

Technical Overrides: Forced metadata for Aperture (f-stop), ISO, and Aspect Ratios.

4. Advanced Lighting Management
Studio vs. Outdoor Logic: Automatic environment switching. Choosing "Studio" triggers a 100% background removal to a neutral cyclorama wall.

Custom Light Control: Full control over up to 3 light sources with Pan (-180° to 180°) and Tilt (-90° to 90°) coordinates.

Low Key Mode: Specialized slider controls for darkness intensity and single-source lighting.

5. Art Direction (The Artistic DNA)
Infuse the stylistic "flavor" of world-renowned photographers (e.g., Juergen Teller, Kacper Kasprzyk) to apply specific color science, film grain, and textures.

🛠️ Installation
Clone the Repository:

Bash

git clone https://github.com/your-repo/cinelab-pro.git
cd cinelab-pro
Install Dependencies:

Bash

pip install streamlit google-generativeai
Configure Secrets: Create a .streamlit/secrets.toml file and add your Google API Key:

Ini, TOML

GOOGLE_API_KEY = "YOUR_API_KEY_HERE"
Prepare Library Data: Ensure your data/library.json is populated with your camera, lens, and artist database.

🖥️ Usage
Run the Application:

Bash

streamlit run main.py
Reference: Upload your 2D reference image.

Equipment: Select your camera body and lens.

Art Direction: Choose an artist style and add director's notes.

Lighting: Toggle between Studio/Outdoor and fine-tune your light positions.

Generate: Click "Generate JSON Recipe" to receive the production-ready prompt data.

📂 Project Structure
main.py: The core Streamlit application logic.

data/library.json: JSON database for equipment, presets, and artists.

assets/: UI elements and styling icons.

Director's Note: CineLab PRO is built for precision. It bridges the gap between raw AI generation and professional cinematography, ensuring that your vision is never "lost in translation."
