# File: test_api.py
# Tujuan: Ngetes endpoint /classify dengan 2 contoh berita.

import requests

API_URL = "http://127.0.0.1:8000/classify"

samples = {
    "tidak_layak_anak": """
Telah terjadi kebakaran tiga rumah dan kios di sebuah permukiman padat penduduk.
Api diduga berasal dari hubungan arus pendek listrik dan dengan cepat menyebar
ke bangunan lain. Beberapa warga mengalami luka bakar dan harus dilarikan
ke rumah sakit, sementara petugas pemadam kebakaran masih berusaha memadamkan api.
""",
    "layak_anak": """
Sejumlah siswa sekolah dasar mengikuti lomba mewarnai dan membaca cerita rakyat
di perpustakaan kelurahan. Kegiatan ini bertujuan menumbuhkan minat baca dan
melatih kreativitas anak sejak dini. Para orang tua mendukung penuh acara tersebut
karena dinilai bermanfaat dan memberikan pengalaman belajar yang menyenangkan.
""",
}

for name, text in samples.items():
    resp = requests.post(API_URL, json={"text": text})
    print(f"\n== Sample: {name} ==")
    print("Status:", resp.status_code)
    print("Body:", resp.json())
