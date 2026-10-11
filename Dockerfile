FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt \
    && python -c "import torch; assert torch.version.cuda is None, f'CUDA build detected: {torch.version.cuda}'; print('Verified CPU-only PyTorch:', torch.__version__)"

RUN addgroup --system clario \
    && adduser --system --ingroup clario clario

COPY . .

RUN mkdir -p /app/data /app/uploads \
    && chown -R clario:clario /app

USER clario

EXPOSE 10000

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]