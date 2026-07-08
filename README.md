# RiverConservation_Project

## Quick run (local, no DB)

1. Open terminal in backend folder:
   cd RiverConservation_Project/backend

2. Create venv & activate:
   python -m venv myenv2
   myenv2\Scripts\activate

3. Install requirements:
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt

4. Place CSV:
   backend/data/water_data_5000.csv

5. Train model:
   python model_train.py

6. Run server:
   python app.py

7. Open frontend:
   Open frontend/index.html in browser (or use Live Server extension)
