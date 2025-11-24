Extension Browser Klasifikasi Berita Layak Anak - IndoBERT

Support Indonesia News Platform
- detik.com
- kompas.com
- tribunnews.com
- yahoo.com
- kumparan.com
- cnnindonesia.com
- tempo.co
- liputan6.com
- cnbcindonesia.com
- news.detik.com

How to use:
- Git clone this repository
- Open folder and change directory to folder model_service
- install all libraries using this command
  pip install -r requirements.txt
- Make sure you have Trained Model IndoBERT (.pth). Copy/Cut model file and paste into folder models in model_service
- Change variable MODEL_DIR in model_loader.py with your Trained Model IndoBERT filename
- Run the API with this command
  bash run.sh
- If the API success, open your browser (Chrome/Edge) and open Extension
- Enable Developer Mode and click Load Unpacked
- Upload browser_extension folder
- Test your extension by open news that supported by this extension 
