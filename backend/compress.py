from PIL import Image
import numpy as np
import pywt
import os


def compress_image(input_path: str):
    # Load image in grayscale
    image = Image.open(input_path).convert("L")

    img_array = np.array(image)

    original_size = os.path.getsize(input_path)

    # STEP 1 — Wavelet Transform (JPEG2000-inspired)
    coeffs = pywt.dwt2(img_array, "haar")

    cA, (cH, cV, cD) = coeffs

    # STEP 2 — Quantization / Thresholding
    threshold = 20

    cH[np.abs(cH) < threshold] = 0
    cV[np.abs(cV) < threshold] = 0
    cD[np.abs(cD) < threshold] = 0

    # STEP 3 — Reconstruct compressed image
    compressed_array = pywt.idwt2((cA, (cH, cV, cD)), "haar")

    compressed_array = np.clip(compressed_array, 0, 255).astype(np.uint8)

    # Save output
    output_path = input_path.rsplit(".", 1)[0] + "_manual_compressed.png"

    Image.fromarray(compressed_array).save(output_path, optimize=True)

    compressed_size = os.path.getsize(output_path)

    # Compression ratio
    if compressed_size < original_size:
        compression_ratio = round(
            ((original_size - compressed_size) / original_size) * 100, 2
        )
    else:
        compression_ratio = -round(
            ((compressed_size - original_size) / original_size) * 100, 2
        )

    return {
        "compressed_path": output_path,
        "original_size_mb": round(original_size / (1024 * 1024), 2),
        "compressed_size_mb": round(compressed_size / (1024 * 1024), 2),
        "compression_ratio": compression_ratio,
    }


# from PIL import Image
# import os


# def compress_image(input_path: str):
#     output_path = input_path.rsplit(".",    1)[0] + ".jp2"

#     original_size = os.path.getsize(input_path)

#     image = Image.open(input_path)

#     # Lossless JPEG2000
#     image.save(output_path, format="JPEG2000")

#     compressed_size = os.path.getsize(output_path)

#     if compressed_size < original_size:
#         compression_ratio = round(
#             ((original_size - compressed_size) / original_size) * 100, 2
#         )
#     else:
#         compression_ratio = round(
#             ((compressed_size - original_size) / original_size) * 100, 2
#         ) * -1

#     return {
#         "compressed_path": output_path,
#         "original_size_mb": round(original_size / (1024 * 1024), 2),
#         "compressed_size_mb": round(compressed_size / (1024 * 1024), 2),
#         "compression_ratio": compression_ratio,
#     }