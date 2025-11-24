# File: app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .model_loader import get_classifier
from .schemas import ClassifyRequest, ClassifyResponse

app = FastAPI(title="Klasifikasi Berita Layak Anak")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # nanti bisa ketatin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/classify", response_model=ClassifyResponse)
async def classify(req: ClassifyRequest):
    try:
        clf = get_classifier()
        result = clf.predict([req.text])[0]
        return ClassifyResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
