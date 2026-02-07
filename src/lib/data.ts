// Mock data for form options - will be used when Supabase is not available

export interface FormOption {
  id: string;
  type: 'brand' | 'device_type' | 'model';
  value: string;
  brand?: string;
  device_type?: string;
}

// Default form options data
let formOptionsData: FormOption[] = [
  // Brands
  { id: '1', type: 'brand', value: 'Apple' },
  { id: '2', type: 'brand', value: 'Samsung' },
  { id: '3', type: 'brand', value: 'Google' },
  { id: '4', type: 'brand', value: 'OnePlus' },
  { id: '5', type: 'brand', value: 'Xiaomi' },

  // Device Types for Apple
  { id: '10', type: 'device_type', value: 'iPhone', brand: 'Apple' },
  { id: '11', type: 'device_type', value: 'iPad', brand: 'Apple' },
  { id: '12', type: 'device_type', value: 'MacBook', brand: 'Apple' },
  { id: '13', type: 'device_type', value: 'Apple Watch', brand: 'Apple' },

  // Device Types for Samsung
  { id: '20', type: 'device_type', value: 'Galaxy S Series', brand: 'Samsung' },
  { id: '21', type: 'device_type', value: 'Galaxy A Series', brand: 'Samsung' },
  { id: '22', type: 'device_type', value: 'Galaxy Tab', brand: 'Samsung' },
  { id: '23', type: 'device_type', value: 'Galaxy Watch', brand: 'Samsung' },

  // Device Types for Google
  { id: '30', type: 'device_type', value: 'Pixel Phone', brand: 'Google' },
  { id: '31', type: 'device_type', value: 'Pixel Tablet', brand: 'Google' },
  { id: '32', type: 'device_type', value: 'Pixel Watch', brand: 'Google' },

  // Device Types for OnePlus
  { id: '40', type: 'device_type', value: 'OnePlus Phone', brand: 'OnePlus' },
  { id: '41', type: 'device_type', value: 'OnePlus Watch', brand: 'OnePlus' },

  // Device Types for Xiaomi
  { id: '50', type: 'device_type', value: 'Xiaomi Phone', brand: 'Xiaomi' },
  { id: '51', type: 'device_type', value: 'Redmi Phone', brand: 'Xiaomi' },

  // Models for Apple iPhone
  { id: '100', type: 'model', value: 'iPhone 15 Pro Max', brand: 'Apple', device_type: 'iPhone' },
  { id: '101', type: 'model', value: 'iPhone 15 Pro', brand: 'Apple', device_type: 'iPhone' },
  { id: '102', type: 'model', value: 'iPhone 15', brand: 'Apple', device_type: 'iPhone' },
  { id: '103', type: 'model', value: 'iPhone 14 Pro Max', brand: 'Apple', device_type: 'iPhone' },
  { id: '104', type: 'model', value: 'iPhone 14 Pro', brand: 'Apple', device_type: 'iPhone' },
  { id: '105', type: 'model', value: 'iPhone 14', brand: 'Apple', device_type: 'iPhone' },
  { id: '106', type: 'model', value: 'iPhone 13', brand: 'Apple', device_type: 'iPhone' },
  { id: '107', type: 'model', value: 'iPhone 12', brand: 'Apple', device_type: 'iPhone' },
  { id: '108', type: 'model', value: 'iPhone SE', brand: 'Apple', device_type: 'iPhone' },

  // Models for Apple iPad
  { id: '110', type: 'model', value: 'iPad Pro 12.9"', brand: 'Apple', device_type: 'iPad' },
  { id: '111', type: 'model', value: 'iPad Pro 11"', brand: 'Apple', device_type: 'iPad' },
  { id: '112', type: 'model', value: 'iPad Air', brand: 'Apple', device_type: 'iPad' },
  { id: '113', type: 'model', value: 'iPad Mini', brand: 'Apple', device_type: 'iPad' },
  { id: '114', type: 'model', value: 'iPad (10th Gen)', brand: 'Apple', device_type: 'iPad' },

  // Models for Apple MacBook
  { id: '120', type: 'model', value: 'MacBook Pro 16"', brand: 'Apple', device_type: 'MacBook' },
  { id: '121', type: 'model', value: 'MacBook Pro 14"', brand: 'Apple', device_type: 'MacBook' },
  { id: '122', type: 'model', value: 'MacBook Air M2', brand: 'Apple', device_type: 'MacBook' },
  { id: '123', type: 'model', value: 'MacBook Air M1', brand: 'Apple', device_type: 'MacBook' },

  // Models for Apple Watch
  { id: '130', type: 'model', value: 'Apple Watch Ultra 2', brand: 'Apple', device_type: 'Apple Watch' },
  { id: '131', type: 'model', value: 'Apple Watch Series 9', brand: 'Apple', device_type: 'Apple Watch' },
  { id: '132', type: 'model', value: 'Apple Watch SE', brand: 'Apple', device_type: 'Apple Watch' },

  // Models for Samsung Galaxy S Series
  { id: '200', type: 'model', value: 'Galaxy S24 Ultra', brand: 'Samsung', device_type: 'Galaxy S Series' },
  { id: '201', type: 'model', value: 'Galaxy S24+', brand: 'Samsung', device_type: 'Galaxy S Series' },
  { id: '202', type: 'model', value: 'Galaxy S24', brand: 'Samsung', device_type: 'Galaxy S Series' },
  { id: '203', type: 'model', value: 'Galaxy S23 Ultra', brand: 'Samsung', device_type: 'Galaxy S Series' },
  { id: '204', type: 'model', value: 'Galaxy S23', brand: 'Samsung', device_type: 'Galaxy S Series' },

  // Models for Samsung Galaxy A Series
  { id: '210', type: 'model', value: 'Galaxy A54', brand: 'Samsung', device_type: 'Galaxy A Series' },
  { id: '211', type: 'model', value: 'Galaxy A34', brand: 'Samsung', device_type: 'Galaxy A Series' },
  { id: '212', type: 'model', value: 'Galaxy A14', brand: 'Samsung', device_type: 'Galaxy A Series' },

  // Models for Google Pixel
  { id: '300', type: 'model', value: 'Pixel 8 Pro', brand: 'Google', device_type: 'Pixel Phone' },
  { id: '301', type: 'model', value: 'Pixel 8', brand: 'Google', device_type: 'Pixel Phone' },
  { id: '302', type: 'model', value: 'Pixel 7 Pro', brand: 'Google', device_type: 'Pixel Phone' },
  { id: '303', type: 'model', value: 'Pixel 7a', brand: 'Google', device_type: 'Pixel Phone' },
];

// Get all form options
export function getFormOptions() {
  const brands = formOptionsData
    .filter(opt => opt.type === 'brand')
    .map(opt => opt.value);

  const deviceTypes: { [key: string]: string[] } = {};
  formOptionsData
    .filter(opt => opt.type === 'device_type')
    .forEach(opt => {
      if (opt.brand) {
        if (!deviceTypes[opt.brand]) {
          deviceTypes[opt.brand] = [];
        }
        deviceTypes[opt.brand].push(opt.value);
      }
    });

  const models: { [key: string]: string[] } = {};
  formOptionsData
    .filter(opt => opt.type === 'model')
    .forEach(opt => {
      if (opt.brand && opt.device_type) {
        const key = `${opt.brand}-${opt.device_type}`;
        if (!models[key]) {
          models[key] = [];
        }
        models[key].push(opt.value);
      }
    });

  return { brands, deviceTypes, models };
}

// Add brand
export function addBrand(brand: string) {
  const id = String(Date.now());
  formOptionsData.push({ id, type: 'brand', value: brand });
  return getFormOptions();
}

// Add device type
export function addDeviceType(brand: string, deviceType: string) {
  const id = String(Date.now());
  formOptionsData.push({ id, type: 'device_type', value: deviceType, brand });
  return getFormOptions();
}

// Add model
export function addModel(brand: string, deviceType: string, model: string) {
  const id = String(Date.now());
  formOptionsData.push({ id, type: 'model', value: model, brand, device_type: deviceType });
  return getFormOptions();
}

// Remove brand (and all its device types and models)
export function removeBrand(brand: string) {
  formOptionsData = formOptionsData.filter(opt =>
    !(opt.type === 'brand' && opt.value === brand) &&
    !(opt.brand === brand)
  );
  return getFormOptions();
}

// Remove device type (and all its models)
export function removeDeviceType(brand: string, deviceType: string) {
  formOptionsData = formOptionsData.filter(opt =>
    !(opt.type === 'device_type' && opt.value === deviceType && opt.brand === brand) &&
    !(opt.type === 'model' && opt.brand === brand && opt.device_type === deviceType)
  );
  return getFormOptions();
}

// Remove model
export function removeModel(brand: string, deviceType: string, model: string) {
  formOptionsData = formOptionsData.filter(opt =>
    !(opt.type === 'model' && opt.value === model && opt.brand === brand && opt.device_type === deviceType)
  );
  return getFormOptions();
}

// ============ REPAIR REQUESTS DATA ============

export interface RepairRequest {
  id: string;
  customer_name: string;
  phone: string;
  email?: string;
  address?: string;
  brand: string;
  device_type: string;
  model: string;
  message?: string;
  status: 'New' | 'In Progress' | 'Completed' | 'On Hold';
  created_at: string;
}

// Sample repair requests for demo
let repairRequestsData: RepairRequest[] = [
  {
    id: 'REQ-001',
    customer_name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john@example.com',
    address: '123 Main St, New York, NY',
    brand: 'Apple',
    device_type: 'iPhone',
    model: 'iPhone 15 Pro',
    message: 'Screen is cracked and battery drains quickly',
    status: 'New',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'REQ-002',
    customer_name: 'Sarah Johnson',
    phone: '(555) 987-6543',
    email: 'sarah@example.com',
    brand: 'Samsung',
    device_type: 'Galaxy S Series',
    model: 'Galaxy S24 Ultra',
    message: 'Not charging properly',
    status: 'In Progress',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 'REQ-003',
    customer_name: 'Mike Brown',
    phone: '(555) 456-7890',
    brand: 'Google',
    device_type: 'Pixel Phone',
    model: 'Pixel 8 Pro',
    message: 'Camera not working',
    status: 'Completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  }
];

let requestCounter = 3;

// Get all repair requests
export function getRepairRequests() {
  return repairRequestsData.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// Get single repair request
export function getRepairRequest(id: string) {
  return repairRequestsData.find(r => r.id === id);
}

// Create new repair request
export function createRepairRequest(data: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  brand: string;
  deviceType: string;
  model: string;
  message?: string;
}) {
  requestCounter++;
  const newRequest: RepairRequest = {
    id: `REQ-${String(requestCounter).padStart(3, '0')}`,
    customer_name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    brand: data.brand,
    device_type: data.deviceType,
    model: data.model,
    message: data.message,
    status: 'New',
    created_at: new Date().toISOString()
  };
  repairRequestsData.push(newRequest);
  return newRequest;
}

// Update repair request
export function updateRepairRequest(id: string, data: Partial<Omit<RepairRequest, 'id' | 'created_at'>>) {
  const request = repairRequestsData.find(r => r.id === id);
  if (request) {
    if (data.customer_name) request.customer_name = data.customer_name;
    if (data.phone) request.phone = data.phone;
    if (data.email !== undefined) request.email = data.email;
    if (data.address !== undefined) request.address = data.address;
    if (data.brand) request.brand = data.brand;
    if (data.device_type) request.device_type = data.device_type;
    if (data.model) request.model = data.model;
    if (data.message !== undefined) request.message = data.message;
    if (data.status) request.status = data.status;
    return request;
  }
  return null;
}

// Update repair request status
export function updateRepairRequestStatus(id: string, status: RepairRequest['status']) {
  const request = repairRequestsData.find(r => r.id === id);
  if (request) {
    request.status = status;
    return request;
  }
  return null;
}

// Delete repair request
export function deleteRepairRequest(id: string) {
  console.log(`[deleteRepairRequest] Looking for ID: "${id}"`);
  console.log(`[deleteRepairRequest] Available IDs:`, repairRequestsData.map(r => r.id));

  const index = repairRequestsData.findIndex(r => r.id === id);
  console.log(`[deleteRepairRequest] Found at index: ${index}`);

  if (index !== -1) {
    const removed = repairRequestsData.splice(index, 1);
    console.log(`[deleteRepairRequest] Removed:`, removed[0]?.id);
    return true;
  }
  return false;
}
