# ---

**PRD: Interactive Holiday Particle System with Hand Tracking**

## **1\. Project Overview**

* **Goal:** Tạo một ứng dụng web hiển thị hệ thống hạt (particles) 3D hình cây thông Noel, cho phép người dùng tương tác bằng cách khua tay trước Webcam.  
* **Core Experience:** Khi người dùng đưa tay lại gần các hạt sáng trên màn hình, các hạt sẽ bị đẩy ra (tạo hiệu ứng nổ/vỡ) và sau đó từ từ quay trở lại vị trí cũ để tái tạo hình dáng ban đầu.  
* **Technology Stack:**  
  * **Frontend:** HTML5, CSS3, JavaScript.  
  * **3D Engine:** Three.js.  
  * **Hand Tracking:** Google MediaPipe Hands.  
  * **Deployment:** Chạy trực tiếp trên trình duyệt (Localhost hoặc Vercel/Netlify).

## ---

**2\. Functional Requirements**

### **2.1. 3D Scene Setup**

* Khởi tạo một Scene Three.js với nền đen (\#000000).  
* Tạo một hệ thống hạt (Points) gồm ít nhất 5,000 \- 10,000 hạt sáng.  
* Sắp xếp các hạt theo tọa độ của một hình nón (Cone) hoặc mô hình 3D cây thông để tạo hình dáng ban đầu.  
* Thêm hiệu ứng **Bloom** (Post-processing) để các hạt trông như đang phát sáng lấp lánh.

### **2.2. Hand Tracking Integration**

* Sử dụng Webcam để bắt hình ảnh người dùng.  
* Tích hợp MediaPipe Hands để lấy tọa độ thời gian thực của các khớp ngón tay.  
* **Focus Point:** Lấy tọa độ của đầu ngón trỏ (Index Finger Tip \- Landmark \#8).

### **2.3. Interaction Logic**

* **Mapping:** Chuyển đổi tọa độ 2D từ Webcam ($0$ đến $1$) sang tọa độ 3D trong Scene (World Space).  
* **Collision Detection:**  
  * Nếu khoảng cách ($dist$) giữa Ngón trỏ và Hạt \< $Threshold$: Hạt sẽ nhận một lực đẩy (velocity) theo hướng từ ngón tay trỏ ra xa.  
  * Lực đẩy tỉ lệ nghịch với khoảng cách (càng gần đẩy càng mạnh).  
* **Homecoming Effect:** Mỗi hạt luôn ghi nhớ "vị trí gốc" (Home Position). Sau khi bị đẩy đi, hạt sẽ chịu một lực kéo nhẹ để quay về vị trí cũ (Spring physics).

## ---

**3\. Technical Specifications**

### **3.1. Physics Parameters (Tweakable)**

| Parameter | Description | Suggested Value |
| :---- | :---- | :---- |
| particleCount | Số lượng hạt | 8,000 |
| mouseRadius | Bán kính tác động của tay | 50 \- 100 units |
| returnSpeed | Tốc độ hạt quay về vị trí cũ | 0.05 |
| bloomStrength | Độ rực rỡ của ánh sáng | 1.5 |

### **3.2. Performance Optimization**

* Sử dụng BufferGeometry trong Three.js để tối ưu bộ nhớ.  
* Xử lý logic di chuyển hạt trong vòng lặp requestAnimationFrame.  
* (Nâng cao) Nếu lag, chuyển logic tính toán va chạm vào **Custom Shader (GLSL)**.

## ---

**4\. UI/UX Requirements**

* **Full-screen Mode:** Ứng dụng chạy toàn màn hình.  
* **Webcam Preview:** Một khung nhỏ ở góc màn hình hiển thị luồng video từ webcam (có vẽ các điểm landmark của tay) để người dùng dễ căn chỉnh vị trí tay.  
* **Responsive:** Hoạt động tốt trên các kích thước màn hình máy tính khác nhau.

## ---

**5\. Implementation Roadmap (Dành cho AI)**

1. **Phase 1:** Setup cấu trúc HTML/CSS cơ bản và khởi tạo Scene Three.js với một khối lập phương xoay (để check render).  
2. **Phase 2:** Thay khối lập phương bằng hệ thống hạt hình cây thông.  
3. **Phase 3:** Tích hợp Webcam và MediaPipe Hands, log tọa độ ngón trỏ ra console.  
4. **Phase 4:** Viết hàm cập nhật vị trí hạt dựa trên tọa độ ngón trỏ (Physics logic).  
5. **Phase 5:** Thêm hiệu ứng Bloom và tinh chỉnh màu sắc hạt (vàng, trắng, xanh Noel).

## ---

