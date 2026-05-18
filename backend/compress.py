from PIL import Image
import os


def compress_image(input_path: str):
    output_path = input_path.rsplit(".", 1)[0] + ".jp2"

    original_size = os.path.getsize(input_path)

    image = Image.open(input_path)

    # Lossless JPEG2000
    image.save(output_path, format="JPEG2000")

    compressed_size = os.path.getsize(output_path)

    if compressed_size < original_size:
        compression_ratio = round(
            ((original_size - compressed_size) / original_size) * 100, 2
        )
    else:
        compression_ratio = round(
            ((compressed_size - original_size) / original_size) * 100, 2
        ) * -1

    return {
        "compressed_path": output_path,
        "original_size_mb": round(original_size / (1024 * 1024), 2),
        "compressed_size_mb": round(compressed_size / (1024 * 1024), 2),
        "compression_ratio": compression_ratio,
    }