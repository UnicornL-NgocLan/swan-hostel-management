# Kế hoạch phát triển phần mềm quản lý nhà trọ

> **Stack:** ReactJS + Node.js + MongoDB  
> **Mục tiêu:** Xây dựng phần mềm quản lý nhà trọ cho người quen, lấy **Optimate** làm baseline về nghiệp vụ và phạm vi chức năng, nhưng triển khai thành ứng dụng web riêng.
>
> Tham chiếu chức năng từ trang Optimate: thiết lập thông tin chủ nhà, cơ sở/phòng, khách thuê/hợp đồng, điện nước/hóa đơn, trả phòng, thu chi/công nợ và lịch nhắc việc. Optimate hiện mô tả các workflow như giữ chỗ, ký mới, gia hạn, chuyển phòng, thanh lý, quản lý tiền cọc, lập hóa đơn, VietQR, công nợ và báo cáo. 

---

## 1. Mục tiêu dự án

### 1.1. Mục tiêu chính

Xây dựng một web app giúp chủ nhà:

- Quản lý một hoặc nhiều cơ sở nhà trọ.
- Quản lý tầng, phòng và trạng thái phòng.
- Quản lý khách thuê và người ở cùng.
- Quản lý hợp đồng.
- Quản lý tiền cọc.
- Quản lý dịch vụ của từng phòng.
- Ghi nhận điện/nước hàng tháng.
- Tự động tính hóa đơn.
- Theo dõi đã thu/chưa thu/công nợ.
- Quản lý thu chi.
- Thực hiện trả phòng và quyết toán.
- Theo dõi các việc sắp đến hạn.
- In/xuất các chứng từ cơ bản.

### 1.2. Nguyên tắc

1. Bám sát nghiệp vụ Optimate.
2. Không xây ERP quá phức tạp.
3. Ưu tiên thao tác nhanh trên điện thoại.
4. MongoDB là database chính.
5. Node.js chịu trách nhiệm API và business logic.
6. ReactJS chịu trách nhiệm UI.
7. Business logic không đặt trong React.
8. Các thao tác ảnh hưởng đến tiền phải có audit log tối thiểu.
9. Không xóa dữ liệu nghiệp vụ quan trọng; ưu tiên `status`/`isActive`.
10. Thiết kế đủ tốt để sau này có thể mở rộng nhưng không over-engineering ở phiên bản đầu.

---

# 2. Phạm vi chức năng

## 2.1. Dashboard

- Tổng số cơ sở.
- Tổng số phòng.
- Phòng trống.
- Phòng đang thuê.
- Phòng giữ cọc.
- Phòng đang sửa.
- Doanh thu kỳ hiện tại.
- Công nợ.
- Tiền cọc đang giữ.
- Các hóa đơn đến hạn.
- Hợp đồng sắp hết hạn.
- Kỳ điện/nước chưa nhập.
- Các khoản cần xử lý.

## 2.2. Cơ sở

- Danh sách cơ sở.
- Tạo/sửa cơ sở.
- Thông tin chủ nhà.
- Logo.
- Địa chỉ.
- Thông tin liên hệ.
- Tài khoản ngân hàng.
- Cấu hình VietQR.
- Cấu hình giá điện/nước.
- Cấu hình danh mục thu/chi.
- Cấu hình khoản trừ khi trả phòng.

## 2.3. Tầng và phòng

- Tạo tầng.
- Tạo phòng.
- Sửa phòng.
- Xem sơ đồ phòng.
- Trạng thái phòng:
  - `AVAILABLE`
  - `RESERVED`
  - `OCCUPIED`
  - `MAINTENANCE`
- Giá phòng mặc định.
- Diện tích.
- Sức chứa.
- Ghi chú.
- Dịch vụ gắn với phòng.

## 2.4. Khách thuê

- Họ tên.
- Số điện thoại.
- Ngày sinh.
- Giới tính.
- CCCD.
- Ảnh CCCD mặt trước.
- Ảnh CCCD mặt sau.
- Quê quán.
- Địa chỉ thường trú.
- Zalo.
- Biển số xe.
- Ghi chú.
- Người ở cùng.

## 2.5. Hợp đồng

Workflow:

```text
Giữ chỗ
  ↓
Ký hợp đồng
  ↓
Đang thuê
  ↓
Gia hạn / Chuyển phòng
  ↓
Thanh lý
```

Chức năng:

- Tạo hợp đồng.
- Sửa hợp đồng.
- Gia hạn.
- Chuyển phòng.
- Thanh lý.
- In hợp đồng.
- Theo dõi ngày bắt đầu/kết thúc.
- Theo dõi tiền thuê.
- Theo dõi tiền cọc.
- Theo dõi ngày thanh toán.

## 2.6. Tiền cọc

Trạng thái:

```text
HELD       Đang giữ
REFUNDED   Đã trả
DEDUCTED   Đã trừ
```

Không gộp tiền cọc vào công nợ tiền thuê.

## 2.7. Dịch vụ

Ví dụ:

- Wifi.
- Rác.
- Giữ xe.
- Vệ sinh.
- Dịch vụ khác.

Mỗi phòng có thể có danh sách dịch vụ riêng và đơn giá riêng.

## 2.8. Điện nước

- Điện.
- Nước.
- Chỉ số cũ.
- Chỉ số mới.
- Mức tiêu thụ.
- Đơn giá.
- Thành tiền.
- Ngày ghi nhận.
- Ảnh đồng hồ nếu cần.

Hỗ trợ:

- Giá cố định.
- Giá bậc thang.

## 2.9. Hóa đơn

Một hóa đơn gồm:

```text
Tiền phòng
Điện
Nước
Dịch vụ
Khoản thu khác
Khoản giảm trừ
```

Chức năng:

- Tạo từng hóa đơn.
- Tạo hàng loạt.
- Xem hóa đơn.
- Sửa hóa đơn trước khi chốt.
- Chốt hóa đơn.
- Thu tiền.
- In PDF.
- Tạo VietQR.
- Theo dõi công nợ.

## 2.10. Thanh toán

Phương thức:

- Tiền mặt.
- Chuyển khoản.

Trạng thái:

```text
UNPAID
PARTIAL
PAID
OVERDUE
```

## 2.11. Trả phòng

Workflow:

```text
Yêu cầu trả phòng
      ↓
Chốt chỉ số điện/nước
      ↓
Tính các khoản còn phải trả
      ↓
Tính khoản trừ cọc
      ↓
Hoàn cọc / thu thêm
      ↓
Thanh lý hợp đồng
      ↓
Phòng AVAILABLE
```

## 2.12. Thu chi

### Thu

- Thu tiền phòng.
- Thu tiền cọc.
- Thu khoản khác.

### Chi

- Sửa chữa.
- Điện nước chung.
- Mua vật tư.
- Vệ sinh.
- Chi phí khác.

Báo cáo:

```text
Tổng thu
Tổng chi
Chênh lệch
```

## 2.13. Công nợ

Theo:

- Phòng.
- Khách thuê.
- Hợp đồng.
- Hóa đơn.
- Kỳ thanh toán.

Phân loại:

```text
Chưa đến hạn
Đến hạn
Quá hạn
Đã thanh toán
```

## 2.14. Nhắc việc

Các loại:

- Hóa đơn đến hạn.
- Hóa đơn quá hạn.
- Hợp đồng sắp hết hạn.
- Ngày trả phòng.
- Chưa nhập điện nước.
- Tiền cọc cần xử lý.

---

# 3. Kiến trúc hệ thống

```text
┌──────────────────────────────┐
│          ReactJS             │
│                              │
│ Dashboard / Rooms / Billing  │
│ Contracts / Tenants / Reports│
└──────────────┬───────────────┘
               │ HTTP / JSON
               │ JWT
               ▼
┌──────────────────────────────┐
│          Node.js             │
│          Express             │
│                              │
│ Routes                       │
│ Controllers                  │
│ Services                     │
│ Models                       │
│ Validators                   │
│ Authentication               │
│ Business Logic               │
└──────────────┬───────────────┘
               │ Mongoose
               ▼
┌──────────────────────────────┐
│           MongoDB            │
└──────────────────────────────┘
```

---

# 4. Backend architecture

Khuyến nghị:

```text
server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   ├── jobs/
│   ├── constants/
│   └── app.js
│
├── uploads/
├── tests/
├── .env
├── package.json
└── server.js
```

## 4.1. Controllers

Controller chỉ xử lý:

```text
Request
 ↓
Validate
 ↓
Call Service
 ↓
Response
```

Không đặt business logic phức tạp trong controller.

## 4.2. Services

Ví dụ:

```text
contract.service.js
invoice.service.js
payment.service.js
meter.service.js
checkout.service.js
room.service.js
```

Các nghiệp vụ quan trọng đặt tại đây.

---

# 5. Frontend architecture

```text
client/
├── src/
│   ├── api/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── hooks/
│   ├── stores/
│   ├── utils/
│   ├── constants/
│   ├── routes/
│   └── App.jsx
│
├── public/
└── package.json
```

Đề xuất:

- React Router.
- Axios.
- Ant Design hoặc MUI.
- React Hook Form.
- Zod/Yup cho validation.
- Zustand nếu cần state management.

Không cần Redux nếu ứng dụng nhỏ.

---

# 6. MongoDB Data Model

## 6.1. User

```js
{
  _id,
  username,
  passwordHash,
  fullName,
  phone,
  role,
  isActive,
  createdAt,
  updatedAt
}
```

## 6.2. Property

```js
{
  _id,
  name,
  code,
  address,
  owner: {
    name,
    phone,
    email
  },
  logo,
  bankAccounts: [],
  settings: {
    electricityPricingType,
    waterPricingType
  },
  isActive,
  createdAt,
  updatedAt
}
```

## 6.3. Floor

```js
{
  _id,
  propertyId,
  name,
  sortOrder,
  isActive
}
```

## 6.4. Room

```js
{
  _id,
  propertyId,
  floorId,
  code,
  name,
  area,
  capacity,
  rentAmount,
  status,
  note,
  createdAt,
  updatedAt
}
```

## 6.5. Tenant

```js
{
  _id,
  fullName,
  phone,
  dateOfBirth,
  gender,
  identityNumber,
  identityIssueDate,
  identityIssuePlace,
  hometown,
  permanentAddress,
  zalo,
  vehiclePlate,
  documents: [],
  note,
  createdAt,
  updatedAt
}
```

## 6.6. Contract

```js
{
  _id,
  contractNo,
  propertyId,
  roomId,
  primaryTenantId,

  occupants: [
    {
      tenantId,
      relationship
    }
  ],

  startDate,
  endDate,

  rentAmount,
  depositAmount,
  paymentDueDay,

  status,

  createdAt,
  updatedAt
}
```

## 6.7. Service

```js
{
  _id,
  propertyId,
  name,
  code,
  defaultPrice,
  billingType,
  isActive
}
```

## 6.8. RoomService

```js
{
  _id,
  roomId,
  serviceId,
  price,
  startDate,
  endDate,
  isActive
}
```

## 6.9. Meter

Mỗi phòng có đồng hồ điện và đồng hồ nước riêng. Không quản lý chỉ số điện/nước ở cấp Property.

Quan hệ:

```text
Property
   │
   ├── Room P101
   │      ├── Electricity Meter E001
   │      └── Water Meter W001
   │
   ├── Room P102
   │      ├── Electricity Meter E002
   │      └── Water Meter W002
   │
   └── Room P103
          ├── Electricity Meter E003
          └── Water Meter W003
```

Model:

```js
{
  _id,
  roomId,

  type, // ELECTRICITY / WATER
  meterCode,

  initialReading,
  installedDate,
  removedDate,

  isActive,
  note
}
```

`roomId` là bắt buộc.

Khi thay đồng hồ, không sửa đồng hồ cũ thành đồng hồ mới. Đóng đồng hồ cũ bằng `removedDate`, sau đó tạo Meter mới cho cùng phòng.

## 6.10. MeterReading

Mỗi kỳ thanh toán có một record chỉ số cho từng đồng hồ.

```js
{
  _id,
  roomId,
  meterId,
  type, // ELECTRICITY / WATER
  billingPeriod,
  previousReading,
  currentReading,
  consumption,
  readingDate,
  imageUrl,
  note
}
```

Backend phải xác định `previousReading` từ reading gần nhất của chính `meterId`, thay vì tin tưởng hoàn toàn giá trị do frontend gửi.

Ví dụ:

```text
P101 - Electricity Meter E001

08/2026
1,100 → 1,250 = 150 kWh

09/2026
1,250 → 1,380 = 130 kWh
```

P102 hoàn toàn độc lập:

```text
P102 - Electricity Meter E002

08/2026
2,000 → 2,100 = 100 kWh

09/2026
2,100 → 2,240 = 140 kWh
```

Khi nhập chỉ số mới:

```text
currentReading = 1,380

Backend:
previousReading = 1,250
consumption = 1,380 - 1,250
            = 130
```

Không cho phép chỉ số mới nhỏ hơn chỉ số trước, trừ khi có nghiệp vụ thay đồng hồ hoặc người có quyền thực hiện điều chỉnh.

## 6.11. InvoiceLine - liên kết với chỉ số điện/nước

Đối với dòng tiền điện/nước, nên lưu reference tới `MeterReading`:

```js
{
  type: "ELECTRICITY",
  name: "Tiền điện tháng 09/2026",
  quantity: 130,
  unitPrice: 4000,
  amount: 520000,
  referenceId: meterReadingId
}
```

Nhờ đó có thể truy vết:

```text
Invoice
   ↓
InvoiceLine
   ↓
MeterReading
   ↓
Meter E001
   ↓
Room P101
```


## 6.11. Invoice

```js
{
  _id,
  invoiceNo,
  propertyId,
  roomId,
  contractId,
  tenantId,

  billingPeriod,
  issueDate,
  dueDate,

  lines: [
    {
      type,
      name,
      quantity,
      unitPrice,
      amount,
      referenceId
    }
  ],

  subtotal,
  discount,
  totalAmount,
  paidAmount,
  balanceAmount,

  status,

  createdAt,
  updatedAt
}
```

## 6.12. Payment

```js
{
  _id,
  propertyId,
  invoiceId,
  roomId,
  tenantId,

  amount,
  paymentDate,
  method,

  reference,
  note,

  createdBy,
  createdAt
}
```

## 6.13. Deposit

```js
{
  _id,
  contractId,
  roomId,
  tenantId,

  amount,
  receivedDate,

  status,

  refundedAmount,
  deductedAmount,

  note
}
```

## 6.14. Expense

```js
{
  _id,
  propertyId,

  type,
  category,
  amount,

  expenseDate,
  description,

  paymentMethod,
  createdBy,

  createdAt,
  updatedAt
}
```

## 6.15. Notification

```js
{
  _id,
  propertyId,
  type,
  title,
  message,
  referenceType,
  referenceId,
  dueDate,
  isRead,
  createdAt
}
```

## 6.16. AuditLog

Chỉ cần cho nghiệp vụ quan trọng:

```js
{
  _id,
  userId,
  action,
  entityType,
  entityId,
  before,
  after,
  createdAt
}
```

---

# 7. Room State Machine

```text
AVAILABLE
   │
   ├── reserve ──→ RESERVED
   │                  │
   │                  └── cancel ──→ AVAILABLE
   │
   └── contract ──→ OCCUPIED
                       │
                       ├── transfer ──→ AVAILABLE
                       │
                       └── checkout ──→ AVAILABLE

AVAILABLE ── maintenance ──→ MAINTENANCE
MAINTENANCE ── complete ──→ AVAILABLE
```

Không cho frontend tự ý đổi status nếu status đó là kết quả của nghiệp vụ.

Ví dụ:

```text
Không:
PUT /rooms/:id
{
  status: "AVAILABLE"
}
```

Mà:

```text
POST /rooms/:id/checkout
POST /rooms/:id/reserve
POST /rooms/:id/maintenance
```

Backend tự cập nhật trạng thái.

---

# 8. Contract State Machine

```text
DRAFT
  ↓
RESERVED
  ↓
ACTIVE
  ├── RENEWED
  ├── TRANSFERRED
  └── TERMINATED
          ↓
       COMPLETED
```

---

# 9. Invoice State Machine

```text
DRAFT
  ↓
ISSUED
  ├── PARTIAL
  │     ↓
  └── PAID

ISSUED ── quá hạn ──→ OVERDUE
OVERDUE ── payment ──→ PARTIAL / PAID
```

Không xóa invoice đã thanh toán.

Nếu sai:

```text
VOID
```

và tạo lại hóa đơn.

---

# 10. API Design

## Authentication

```http
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Properties

```http
GET    /api/properties
POST   /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
```

## Floors

```http
GET    /api/properties/:propertyId/floors
POST   /api/properties/:propertyId/floors
PUT    /api/floors/:id
DELETE /api/floors/:id
```

## Rooms

```http
GET  /api/properties/:propertyId/rooms
POST /api/properties/:propertyId/rooms
GET  /api/rooms/:id
PUT  /api/rooms/:id

POST /api/rooms/:id/reserve
POST /api/rooms/:id/maintenance
POST /api/rooms/:id/checkout
```

## Tenants

```http
GET  /api/tenants
POST /api/tenants
GET  /api/tenants/:id
PUT  /api/tenants/:id
```

## Contracts

```http
GET  /api/contracts
POST /api/contracts
GET  /api/contracts/:id
PUT  /api/contracts/:id

POST /api/contracts/:id/renew
POST /api/contracts/:id/transfer
POST /api/contracts/:id/terminate
```

## Meter

```http
GET  /api/meter-readings
POST /api/meter-readings
PUT  /api/meter-readings/:id

POST /api/meter-readings/bulk
```

## Invoice

```http
GET  /api/invoices
GET  /api/invoices/:id

POST /api/invoices/generate
POST /api/invoices/generate-bulk

PUT  /api/invoices/:id
POST /api/invoices/:id/issue
POST /api/invoices/:id/void
```

## Payment

```http
GET  /api/payments
POST /api/payments
```

## Checkout

```http
POST /api/contracts/:id/checkout-preview
POST /api/contracts/:id/checkout
```

`checkout-preview` rất quan trọng: tính toán trước nhưng chưa ghi dữ liệu.

---

# 11. Business Flow: tạo khách thuê

```text
Chọn phòng AVAILABLE
       ↓
Nhập khách thuê
       ↓
Nhập hợp đồng
       ↓
Nhập tiền cọc
       ↓
Xác nhận
       ↓
Create Contract
       ↓
Room = OCCUPIED
       ↓
Deposit = HELD
```

Backend nên thực hiện các bước liên quan trong một transaction.

---

# 12. Business Flow: tạo hóa đơn tháng

```text
Chọn kỳ billing
       ↓
Lấy phòng OCCUPIED
       ↓
Lấy Contract ACTIVE
       ↓
Lấy giá phòng
       ↓
Lấy Meter Reading
       ↓
Tính điện
       ↓
Tính nước
       ↓
Lấy Room Service
       ↓
Tạo Invoice Lines
       ↓
Tính Total
       ↓
Lưu Invoice
```

Không nên tính lại hóa đơn mỗi lần mở màn hình.

Invoice sau khi issue phải lưu snapshot giá trị.

---

# 13. Business Flow: thu tiền

```text
Invoice
   ↓
User nhập số tiền
   ↓
Validate amount <= balance
   ↓
Create Payment
   ↓
Update paidAmount
   ↓
Update balanceAmount
   ↓
Nếu balance = 0
      ↓
    PAID
```

Nếu:

```text
payment < balance
```

thì:

```text
PARTIAL
```

---

# 14. Business Flow: trả phòng

```text
Chọn Contract
      ↓
Checkout Preview
      ↓
Chốt điện/nước
      ↓
Tính hóa đơn cuối
      ↓
Lấy công nợ
      ↓
Lấy tiền cọc
      ↓
Tính khoản trừ
      ↓
Tính số tiền hoàn / thu thêm
      ↓
User xác nhận
      ↓
Settlement
      ↓
Contract = TERMINATED
      ↓
Room = AVAILABLE
      ↓
Deposit = REFUNDED / DEDUCTED
```

---

# 15. Frontend Pages

## Dashboard

```text
/pages/dashboard
```

## Property

```text
/pages/properties
/pages/properties/:id
```

## Room

```text
/pages/rooms
/pages/rooms/:id
```

## Tenant

```text
/pages/tenants
/pages/tenants/:id
```

## Contract

```text
/pages/contracts
/pages/contracts/:id
```

## Meter

```text
/pages/meter-readings
```

## Invoice

```text
/pages/invoices
/pages/invoices/:id
```

## Payment

```text
/pages/payments
```

## Expense

```text
/pages/expenses
```

## Reports

```text
/pages/reports/revenue
/pages/reports/debt
/pages/reports/occupancy
/pages/reports/income-expense
```

---

# 16. UI Navigation

```text
Dashboard

Quản lý
├── Cơ sở
├── Phòng
├── Khách thuê
├── Hợp đồng
└── Dịch vụ

Điện nước
├── Nhập chỉ số
└── Lịch sử

Thu tiền
├── Hóa đơn
├── Công nợ
├── Tiền cọc
└── Lịch sử thanh toán

Thu chi
├── Phiếu thu
├── Phiếu chi
└── Sổ thu chi

Báo cáo
├── Doanh thu
├── Công nợ
├── Phòng
└── Thu chi

Thiết lập
├── Người dùng
├── Cấu hình
└── Danh mục
```

---

# 17. Quy trình phát triển từ đầu đến cuối

## Phase 0 — Project setup

### Backend

- [ ] Tạo Node.js project.
- [ ] Cài Express.
- [ ] Cài Mongoose.
- [ ] Cài dotenv.
- [ ] Cài cors.
- [ ] Cài helmet.
- [ ] Cài bcrypt.
- [ ] Cài JWT.
- [ ] Cài validation library.
- [ ] Tạo cấu trúc thư mục.
- [ ] Kết nối MongoDB.
- [ ] Health check API.

### Frontend

- [ ] Tạo React project.
- [ ] Cấu hình router.
- [ ] Cấu hình Axios.
- [ ] Cấu hình UI library.
- [ ] Tạo layout.
- [ ] Tạo sidebar.
- [ ] Tạo authentication state.

---

# 18. Phase 1 — Authentication

- [ ] Login.
- [ ] Logout.
- [ ] JWT.
- [ ] Protected route.
- [ ] User profile.
- [ ] Role cơ bản.

Roles ban đầu:

```text
ADMIN
USER
```

Không cần RBAC phức tạp ở MVP.

---

# 19. Phase 2 — Cơ sở và phòng

Backend:

- [ ] Property model.
- [ ] Floor model.
- [ ] Room model.
- [ ] CRUD API.
- [ ] Room status logic.

Frontend:

- [ ] Property list.
- [ ] Property form.
- [ ] Floor management.
- [ ] Room list.
- [ ] Room card.
- [ ] Room detail.
- [ ] Room status.

**Milestone:** Có thể tạo nhà trọ và quản lý phòng.

---

# 20. Phase 3 — Khách thuê và hợp đồng

Backend:

- [ ] Tenant model.
- [ ] Contract model.
- [ ] Deposit model.
- [ ] Create contract service.
- [ ] Renew contract.
- [ ] Transfer room.

Frontend:

- [ ] Tenant list.
- [ ] Tenant detail.
- [ ] Tenant form.
- [ ] Contract form.
- [ ] Contract detail.
- [ ] Deposit detail.

**Milestone:** Có thể đưa khách vào phòng.

---

# 21. Phase 4 — Dịch vụ

- [ ] Service model.
- [ ] RoomService model.
- [ ] Service CRUD.
- [ ] Gán dịch vụ cho phòng.
- [ ] Giá riêng từng phòng.

**Milestone:** Phòng có thể có Wifi/rác/xe/etc.

---

# 22. Phase 5 — Điện nước

- [ ] Meter.
- [ ] MeterReading.
- [ ] Fixed pricing.
- [ ] Tier pricing.
- [ ] Nhập từng phòng.
- [ ] Nhập hàng loạt.
- [ ] Validation chỉ số.
- [ ] Lịch sử chỉ số.

**Milestone:** Có thể chốt điện nước hàng tháng.

---

# 23. Phase 6 — Hóa đơn

Đây là phase quan trọng.

- [ ] Invoice model.
- [ ] InvoiceLine.
- [ ] Billing period.
- [ ] Generate invoice.
- [ ] Generate bulk invoice.
- [ ] Calculate rent.
- [ ] Calculate electricity.
- [ ] Calculate water.
- [ ] Calculate services.
- [ ] Discount.
- [ ] Due date.
- [ ] Invoice status.
- [ ] Invoice detail.

**Milestone:** Có thể phát hành hóa đơn tháng.

---

# 24. Phase 7 — Thanh toán và công nợ

- [ ] Payment model.
- [ ] Record payment.
- [ ] Partial payment.
- [ ] Full payment.
- [ ] Overdue.
- [ ] Debt report.
- [ ] Payment history.

**Milestone:** Quản lý được tiền đã thu và tiền còn nợ.

---

# 25. Phase 8 — Trả phòng

- [ ] Checkout preview.
- [ ] Chốt meter.
- [ ] Final invoice.
- [ ] Outstanding debt.
- [ ] Deposit calculation.
- [ ] Deposit deduction.
- [ ] Refund.
- [ ] Final settlement.
- [ ] Change room status.
- [ ] Close contract.

**Milestone:** Hoàn thiện vòng đời khách thuê.

---

# 26. Phase 9 — Thu chi

- [ ] Expense categories.
- [ ] Expense CRUD.
- [ ] Income tracking.
- [ ] Cash.
- [ ] Bank.
- [ ] Income/expense report.

---

# 27. Phase 10 — Dashboard và báo cáo

Dashboard:

- [ ] Occupancy.
- [ ] Revenue.
- [ ] Debt.
- [ ] Deposit.
- [ ] Expiring contracts.
- [ ] Pending meter readings.
- [ ] Overdue invoices.

Reports:

- [ ] Revenue.
- [ ] Expense.
- [ ] Profit approximation.
- [ ] Debt.
- [ ] Occupancy.
- [ ] Electricity/water consumption.

---

# 28. Phase 11 — PDF

Các PDF cần có:

- [ ] Hợp đồng.
- [ ] Hóa đơn.
- [ ] Phiếu thu.
- [ ] Phiếu trả phòng.

Backend nên generate PDF.

Frontend chỉ gọi:

```http
GET /api/invoices/:id/pdf
```

---

# 29. Phase 12 — VietQR

Cấu hình:

```text
Bank code
Account number
Account name
```

Khi invoice được tạo:

```text
amount = invoice.balanceAmount
content = invoice.invoiceNo
```

Generate QR.

Không hard-code thông tin ngân hàng vào frontend.

---

# 30. Phase 13 — Notification

Job chạy định kỳ:

```text
Daily Job
   │
   ├── Invoice overdue?
   ├── Contract expiring?
   ├── Checkout upcoming?
   └── Meter reading missing?
```

Tạo Notification.

Giai đoạn đầu chỉ cần notification trong app.

Zalo/email có thể làm sau.

---

# 31. Phase 14 — Testing

## Unit test

Test:

- Electricity calculation.
- Water calculation.
- Tier pricing.
- Invoice calculation.
- Deposit calculation.
- Debt calculation.
- Checkout calculation.

## Integration test

Test:

```text
Create tenant
→ Create contract
→ Create invoice
→ Payment
→ Checkout
```

## UI test

Test các flow chính:

```text
Login
Create room
Create tenant
Create contract
Enter meter
Generate invoice
Payment
Checkout
```

---

# 32. Phase 15 — Security

Backend:

- [ ] Password hash bằng bcrypt.
- [ ] JWT expiration.
- [ ] Protected APIs.
- [ ] Input validation.
- [ ] Rate limiting login.
- [ ] Helmet.
- [ ] CORS.
- [ ] File upload validation.
- [ ] Không trả password hash.
- [ ] Không trust `propertyId` từ frontend nếu user không có quyền.

Đặc biệt:

> **Frontend chỉ là giao diện. Backend phải kiểm tra toàn bộ quyền và business rule.**

---

# 33. Phase 16 — Backup

MongoDB phải có backup.

Tối thiểu:

```text
Daily backup
     ↓
MongoDB dump
     ↓
Backup storage
```

Không nên chỉ backup database trên cùng server.

---

# 34. Deployment

Kiến trúc ban đầu:

```text
Internet
    │
    ▼
Nginx
    │
    ├──────────────→ React static files
    │
    └──────────────→ Node.js API
                         │
                         ▼
                      MongoDB
```

Có thể Dockerize:

```text
docker-compose
├── frontend
├── backend
├── mongodb
└── nginx
```

Nếu MongoDB dùng MongoDB Atlas thì:

```text
React
  ↓
Node.js
  ↓
MongoDB Atlas
```

sẽ đơn giản hơn.

---

# 35. Environment Variables

Backend:

```env
NODE_ENV=development

PORT=5000

MONGODB_URI=mongodb://localhost:27017/room-management

JWT_SECRET=
JWT_EXPIRES_IN=7d

UPLOAD_DIR=./uploads

CLIENT_URL=http://localhost:5173
```

Production phải dùng secret thực tế từ environment/secret manager, không commit `.env`.

---

# 36. Quy tắc coding

## Backend

Tên file:

```text
room.model.js
room.controller.js
room.service.js
room.routes.js
```

Service chịu trách nhiệm business logic.

## Frontend

```text
RoomList.jsx
RoomForm.jsx
RoomDetail.jsx
RoomCard.jsx
```

API tách riêng:

```text
roomApi.js
contractApi.js
invoiceApi.js
paymentApi.js
```

Không viết Axios trực tiếp rải rác trong component.

---

# 37. Quy tắc MongoDB

Index quan trọng:

```text
Room
  propertyId
  status

Contract
  roomId
  tenantId
  status
  startDate
  endDate

Invoice
  propertyId
  roomId
  contractId
  billingPeriod
  status

Payment
  invoiceId
  paymentDate

MeterReading
  roomId
  billingPeriod
```

Một số unique constraint cần cân nhắc:

```text
property.code
room: propertyId + code
invoice: invoiceNo
contract.contractNo
```

---

# 38. Các nguyên tắc nghiệp vụ quan trọng

### 1. Không xóa invoice đã thanh toán

Dùng:

```text
VOID
```

nếu cần hủy.

### 2. Không xóa payment

Nếu nhập sai:

```text
REVERSED
```

hoặc tạo adjustment.

### 3. Invoice lưu snapshot

Nếu giá điện thay đổi tháng sau, hóa đơn tháng trước **không được thay đổi**.

### 4. Contract lưu giá thuê tại thời điểm ký

Không lấy giá phòng hiện tại để tính lại hợp đồng cũ.

### 5. Đồng hồ điện/nước thuộc về từng phòng

Mỗi phòng có thể có một đồng hồ điện và một đồng hồ nước đang hoạt động. Không lưu chỉ số điện/nước trực tiếp trên `Room`.

```text
Room
 ├── Electricity Meter
 │      └── MeterReading[]
 │
 └── Water Meter
        └── MeterReading[]
```

Nếu thay đồng hồ, giữ lịch sử đồng hồ cũ và tạo Meter mới. Không ghi đè lịch sử chỉ số.

### 5. Meter reading không được tùy tiện giảm

Ví dụ:

```text
Tháng 08 = 1,250
Tháng 09 = 1,380
```

không cho nhập:

```text
1,200
```

trừ khi có quyền điều chỉnh.

### 6. Checkout phải preview trước

Không cập nhật database ngay khi người dùng mở màn hình trả phòng.

---

# 39. MVP Definition

MVP được coi là hoàn thành khi người dùng có thể thực hiện trọn vẹn:

```text
Tạo cơ sở
    ↓
Tạo phòng
    ↓
Tạo khách thuê
    ↓
Tạo hợp đồng
    ↓
Nhận tiền cọc
    ↓
Phòng = OCCUPIED
    ↓
Nhập điện nước
    ↓
Tạo hóa đơn
    ↓
Thu tiền
    ↓
Theo dõi công nợ
    ↓
Khách trả phòng
    ↓
Quyết toán
    ↓
Hoàn/trừ cọc
    ↓
Phòng = AVAILABLE
```

Nếu flow này chạy ổn, phần mềm đã có **core business hoàn chỉnh**.

---

# 40. Backlog sau MVP

Chỉ làm khi người dùng thực sự cần:

- [ ] Zalo message.
- [ ] Email.
- [ ] Tự động gửi hóa đơn.
- [ ] Bank transaction integration.
- [ ] Tự động đối soát ngân hàng.
- [ ] Tạm trú.
- [ ] Maintenance.
- [ ] Quản lý tài sản.
- [ ] Multi-user permission chi tiết.
- [ ] Mobile app native.
- [ ] Multi-tenant SaaS.
- [ ] Accounting integration.

Không đưa các phần này vào MVP.

---

# 41. Thứ tự code khuyến nghị

```text
01. Project setup
        ↓
02. Authentication
        ↓
03. Property
        ↓
04. Floor
        ↓
05. Room
        ↓
06. Tenant
        ↓
07. Contract
        ↓
08. Deposit
        ↓
09. Service
        ↓
10. Meter
        ↓
11. Meter Reading
        ↓
12. Invoice
        ↓
13. Payment
        ↓
14. Debt
        ↓
15. Checkout
        ↓
16. Income / Expense
        ↓
17. Dashboard
        ↓
18. Reports
        ↓
19. PDF
        ↓
20. VietQR
        ↓
21. Notification
        ↓
22. Testing
        ↓
23. Deployment
        ↓
24. Backup / Monitoring
```

---

# 42. Definition of Done

Một feature chỉ được coi là hoàn thành khi:

- Backend API hoàn thành.
- Validation hoàn thành.
- Business logic hoàn thành.
- Error handling hoàn thành.
- MongoDB index cần thiết đã tạo.
- Frontend hoàn thành.
- Loading state có.
- Empty state có.
- Error state có.
- Permission được kiểm tra.
- Có test cho business logic quan trọng.
- Không có console error.
- Có thể sử dụng trên desktop.
- Có thể sử dụng trên mobile.

---

# 43. Roadmap tổng thể

```text
                ROOM MANAGEMENT
                       │
                       ▼
                TENANT MANAGEMENT
                       │
                       ▼
                CONTRACT MANAGEMENT
                       │
                       ▼
                 DEPOSIT MANAGEMENT
                       │
                       ▼
                METER MANAGEMENT
                       │
                       ▼
                 BILLING ENGINE
                       │
                       ▼
                 PAYMENT / DEBT
                       │
                       ▼
                   CHECKOUT
                       │
                       ▼
                INCOME / EXPENSE
                       │
                       ▼
                 DASHBOARD
                       │
                       ▼
                   REPORTS
                       │
                       ▼
                  PDF / QR
                       │
                       ▼
                NOTIFICATION
                       │
                       ▼
                 DEPLOYMENT
```

---

# 44. Trạng thái dự án

| Module | Status |
|---|---|
| Project setup | TODO |
| Authentication | TODO |
| Property | TODO |
| Floor | TODO |
| Room | TODO |
| Tenant | TODO |
| Contract | TODO |
| Deposit | TODO |
| Service | TODO |
| Meter | TODO |
| Meter Reading | TODO |
| Invoice | TODO |
| Payment | TODO |
| Debt | TODO |
| Checkout | TODO |
| Income / Expense | TODO |
| Dashboard | TODO |
| Reports | TODO |
| PDF | TODO |
| VietQR | TODO |
| Notification | TODO |
| Testing | TODO |
| Deployment | TODO |
| Backup | TODO |

---

# 45. Kết luận

Đây là một **monolithic web application** nhỏ:

```text
ReactJS
   │
   │ REST API
   ▼
Node.js + Express
   │
   │ Mongoose
   ▼
MongoDB
```

Không cần microservices.

Không cần Redis ở phiên bản đầu.

Không cần message queue.

Không cần Elasticsearch.

Không cần Kubernetes.

Không cần event-driven architecture.

Ưu tiên hoàn thành chính xác nghiệp vụ:

```text
Phòng
→ Khách
→ Hợp đồng
→ Điện nước
→ Hóa đơn
→ Thu tiền
→ Công nợ
→ Trả phòng
→ Thu chi
```

Sau khi người quen sử dụng thực tế và phát sinh nhu cầu mới mở rộng tiếp.
