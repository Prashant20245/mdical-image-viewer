from PIL import Image
import numpy as np
import pywt
import os
import heapq
from collections import Counter


# ==========================================
# HUFFMAN NODE
# ==========================================

class HuffmanNode:
    def __init__(self, value, freq):
        self.value = value
        self.freq = freq
        self.left = None
        self.right = None

    def __lt__(self, other):
        return self.freq < other.freq


# ==========================================
# BUILD HUFFMAN TREE
# ==========================================

def build_huffman_tree(data):
    frequency = Counter(data)

    heap = [
        HuffmanNode(value, freq)
        for value, freq in frequency.items()
    ]

    heapq.heapify(heap)

    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)

        merged = HuffmanNode(
            None,
            left.freq + right.freq
        )

        merged.left = left
        merged.right = right

        heapq.heappush(heap, merged)

    return heap[0]


# ==========================================
# GENERATE HUFFMAN CODES
# ==========================================

def generate_codes(node, current_code="", codes=None):

    if codes is None:
        codes = {}

    if node is None:
        return codes

    if node.value is not None:
        codes[node.value] = current_code

    generate_codes(
        node.left,
        current_code + "0",
        codes
    )

    generate_codes(
        node.right,
        current_code + "1",
        codes
    )

    return codes


# ==========================================
# MAIN JPEG2000-INSPIRED COMPRESSION
# ==========================================

def compress_image(input_path: str):

    # ==========================================
    # STEP 1 — LOAD IMAGE
    # ==========================================

    image = Image.open(input_path).convert("RGB")

    original_size = os.path.getsize(input_path)

    img_array = np.array(image)

    # ==========================================
    # STEP 2 — IMAGE TILING
    # ==========================================

    tile_size = 256

    height, width, _ = img_array.shape

    tiled_image = img_array[
        0:min(tile_size, height),
        0:min(tile_size, width)
    ]

    # ==========================================
    # STEP 3 — RGB TO YCbCr
    # ==========================================

    ycbcr_image = Image.fromarray(
        tiled_image.astype(np.uint8)
    ).convert("YCbCr")

    ycbcr_array = np.array(ycbcr_image)

    # Use luminance channel
    Y_channel = ycbcr_array[:, :, 0]

    # ==========================================
    # STEP 4 — LEVEL SHIFTING
    # ==========================================

    shifted = Y_channel.astype(np.int16) - 128

    # ==========================================
    # STEP 5 — DISCRETE WAVELET TRANSFORM
    # ==========================================

    coeffs = pywt.dwt2(
        shifted,
        "haar"
    )

    cA, (cH, cV, cD) = coeffs

    # ==========================================
    # STEP 6 — QUANTIZATION
    # ==========================================

    quantization_step = 10

    cA_q = np.round(cA / quantization_step)
    cH_q = np.round(cH / quantization_step)
    cV_q = np.round(cV / quantization_step)
    cD_q = np.round(cD / quantization_step)

    # ==========================================
    # STEP 7 — FLATTEN COEFFICIENTS
    # ==========================================

    flattened = np.concatenate([
        cA_q.flatten(),
        cH_q.flatten(),
        cV_q.flatten(),
        cD_q.flatten()
    ])

    flattened = flattened.astype(np.int16)

    # ==========================================
    # STEP 8 — HUFFMAN ENCODING
    # ==========================================

    tree = build_huffman_tree(flattened)

    codes = generate_codes(tree)

    encoded_data = "".join(
        codes[value]
        for value in flattened
    )

    # ==========================================
    # STEP 9 — ESTIMATE COMPRESSED SIZE
    # ==========================================

    # Convert bits → bytes
    compressed_size = len(encoded_data) / 8

    # ==========================================
    # STEP 10 — RECONSTRUCTION
    # ==========================================

    cA_r = cA_q * quantization_step
    cH_r = cH_q * quantization_step
    cV_r = cV_q * quantization_step
    cD_r = cD_q * quantization_step

    reconstructed = pywt.idwt2(
        (cA_r, (cH_r, cV_r, cD_r)),
        "haar"
    )

    reconstructed += 128

    reconstructed = np.clip(
        reconstructed,
        0,
        255
    ).astype(np.uint8)

    # ==========================================
    # STEP 11 — SAVE RECONSTRUCTED IMAGE
    # ==========================================

    output_path = (
        input_path.rsplit(".", 1)[0]
        + "_jpeg2000_pipeline.png"
    )

    Image.fromarray(reconstructed).save(
        output_path,
        optimize=True
    )

    # ==========================================
    # STEP 12 — COMPRESSION RATIO
    # ==========================================

    if compressed_size < original_size:
        compression_ratio = round(
            (
                (original_size - compressed_size)
                / original_size
            ) * 100,
            2
        )
    else:
        compression_ratio = -round(
            (
                (compressed_size - original_size)
                / original_size
            ) * 100,
            2
        )

    # ==========================================
    # STEP 13 — RETURN RESULTS
    # ==========================================

    return {
        "compressed_path": output_path,

        "original_size_mb": round(
            original_size / (1024 * 1024),
            4
        ),

        "compressed_size_mb": round(
            compressed_size / (1024 * 1024),
            4
        ),

        "compression_ratio": compression_ratio,

        "encoding_bits": len(encoded_data),

        "compression_method":
            "JPEG2000-inspired pipeline using "
            "Tiling + YCbCr + Level Shift + "
            "DWT + Quantization + Huffman Encoding"
    }
