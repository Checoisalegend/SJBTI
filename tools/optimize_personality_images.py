from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = ROOT / "assets" / "personality-images"
DELIVERY_SIZE = (960, 1280)


def main() -> None:
    source_bytes = 0
    optimized_bytes = 0
    converted = 0

    for source in sorted(IMAGE_DIR.glob("*.png")):
        target = source.with_suffix(".webp")
        with Image.open(source) as image:
            original = image.convert("RGBA")
            delivery = original.copy()
            delivery.thumbnail(DELIVERY_SIZE, Image.Resampling.LANCZOS)
            delivery.save(target, "WEBP", lossless=True, method=6, exact=True)

        with Image.open(target) as encoded:
            decoded = encoded.convert("RGBA")
            if not np.array_equal(np.asarray(delivery), np.asarray(decoded)):
                target.unlink(missing_ok=True)
                raise RuntimeError(f"Lossless verification failed: {source.name}")

        source_bytes += source.stat().st_size
        optimized_bytes += target.stat().st_size
        converted += 1

    saving = 0 if source_bytes == 0 else (1 - optimized_bytes / source_bytes) * 100
    print(
        f"Optimized {converted} images: "
        f"{source_bytes / 1024 / 1024:.2f} MB -> "
        f"{optimized_bytes / 1024 / 1024:.2f} MB "
        f"({saving:.1f}% smaller), lossless after delivery-size resampling."
    )


if __name__ == "__main__":
    main()
