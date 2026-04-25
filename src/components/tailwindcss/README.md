# Tailwind CSS Components Library

Thư viện UI components được xây dựng hoàn toàn bằng Tailwind CSS, thay thế cho MUI.

## 📦 Cài đặt Dependencies

```bash
npm install @tanstack/react-table @headlessui/react
```

## 🎨 Components

### Button
```jsx
import { Button } from '@/components/tailwindcss/ui';

<Button variant="primary" size="md" startIcon={<Icon />}>
  Click me
</Button>
```

**Variants:** `primary`, `secondary`, `danger`, `success`, `outline`, `ghost`  
**Sizes:** `sm`, `md`, `lg`

### Input
```jsx
import { Input } from '@/components/tailwindcss/ui';

<Input
  label="Email"
  placeholder="Enter email"
  startIcon={<Mail />}
  error="Invalid email"
  helperText="We'll never share your email"
/>
```

### Chip
```jsx
import { Chip } from '@/components/tailwindcss/ui';

<Chip variant="primary" size="md" icon={<Icon />}>
  Label
</Chip>
```

**Variants:** `default`, `primary`, `success`, `warning`, `danger`, `outline`

### Dialog
```jsx
import { Dialog } from '@/components/tailwindcss/ui';

<Dialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Dialog Title"
  size="md"
  footer={<Button>Save</Button>}
>
  Content here
</Dialog>
```

**Sizes:** `sm`, `md`, `lg`, `xl`, `full`

### DataTable
```jsx
import DataTable from '@/components/tailwindcss/ui/DataTable';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => <span>{getValue()}</span>
  }
];

<DataTable
  data={data}
  columns={columns}
  loading={false}
  searchable={true}
  pageSize={25}
/>
```

## 📚 Usage Example

Xem file `src/app/(admin)/categories-tailwind/page.js` để xem ví dụ sử dụng đầy đủ.

