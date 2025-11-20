# Skeleton Component - Hướng dẫn sử dụng

Component Skeleton tập trung cho toàn bộ hệ thống, đảm bảo đồng bộ và dễ bảo trì.

## Import

```javascript
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonButton, 
  SkeletonImage, 
  SkeletonCard,
  SkeletonTableRow,
  SkeletonProductCard,
  SkeletonFormSection,
  SkeletonOrderSummary,
  SkeletonCheckout,
  SkeletonLoadingOverlay
} from '@/components/Skeleton';
```

Hoặc từ LoadingAnimations (tương thích ngược):

```javascript
import { Skeleton, SkeletonText, ... } from '@/components/LoadingAnimations';
```

## Các Component có sẵn

### 1. Skeleton (Base Component)
Component cơ bản nhất, có thể tùy chỉnh hoàn toàn.

```jsx
<Skeleton variant="rectangular" width="w-full" height="h-4" />
<Skeleton variant="circular" width="w-16" height="h-16" />
<Skeleton variant="rounded" width="w-24" height="h-10" />
```

**Props:**
- `variant`: `"text" | "rectangular" | "circular" | "rounded" | "roundedXL" | "rounded2XL"` (default: `"rectangular"`)
- `width`: Tailwind width class (default: `"w-full"`)
- `height`: Tailwind height class (default: `"h-4"`)
- `className`: Additional classes

### 2. SkeletonText
Skeleton cho text, hỗ trợ nhiều dòng.

```jsx
<SkeletonText lines={1} width="w-full" height="h-4" />
<SkeletonText lines={3} width="w-3/4" height="h-4" spacing="space-y-2" />
```

**Props:**
- `lines`: Số dòng text (default: `1`)
- `width`: Tailwind width class (default: `"w-full"`)
- `height`: Tailwind height class (default: `"h-4"`)
- `spacing`: Spacing giữa các dòng (default: `"space-y-2"`)
- `className`: Additional classes

### 3. SkeletonButton
Skeleton cho button.

```jsx
<SkeletonButton width="w-24" height="h-10" rounded="rounded-lg" />
<SkeletonButton width="w-full" height="h-14" rounded="rounded-xl" />
```

**Props:**
- `width`: Tailwind width class (default: `"w-24"`)
- `height`: Tailwind height class (default: `"h-10"`)
- `rounded`: Border radius (default: `"rounded-lg"`)
- `className`: Additional classes

### 4. SkeletonImage
Skeleton cho image/avatar.

```jsx
<SkeletonImage width="w-full" height="h-48" rounded="rounded-lg" />
<SkeletonImage width="w-16" height="h-16" rounded="rounded-full" aspectRatio="4/3" />
```

**Props:**
- `width`: Tailwind width class (default: `"w-full"`)
- `height`: Tailwind height class (default: `"h-48"`)
- `aspectRatio`: Aspect ratio (optional)
- `rounded`: Border radius (default: `"rounded-lg"`)
- `className`: Additional classes

### 5. SkeletonCard
Container cho skeleton card.

```jsx
<SkeletonCard padding="p-4">
  <SkeletonText lines={2} />
  <SkeletonImage width="w-full" height="h-32" />
</SkeletonCard>
```

**Props:**
- `padding`: Padding class (default: `"p-4"`)
- `className`: Additional classes
- `children`: Skeleton content

### 6. SkeletonTableRow
Skeleton cho table row.

```jsx
<SkeletonTableRow cols={4} />
<SkeletonTableRow cols={6} className="border-b" />
```

**Props:**
- `cols`: Số cột (default: `4`)
- `className`: Additional classes

### 7. SkeletonInput
Skeleton cho input field (có label).

```jsx
<SkeletonInput label={true} />
<SkeletonInput label={false} className="mb-4" />
```

**Props:**
- `label`: Hiển thị label skeleton (default: `true`)
- `className`: Additional classes

### 8. SkeletonProductCard
Skeleton hoàn chỉnh cho product card.

```jsx
<SkeletonProductCard />
<SkeletonProductCard className="mb-4" />
```

**Props:**
- `className`: Additional classes

### 9. SkeletonFormSection
Skeleton cho form section với title, icon và inputs.

```jsx
<SkeletonFormSection title icon inputs={4} />
<SkeletonFormSection title={false} inputs={2} />
```

**Props:**
- `title`: Hiển thị title skeleton (default: `true`)
- `icon`: Hiển thị icon skeleton (default: `true`)
- `inputs`: Số input fields (default: `2`)
- `className`: Additional classes

### 10. SkeletonOrderSummary
Skeleton cho order summary sidebar.

```jsx
<SkeletonOrderSummary items={3} />
<SkeletonOrderSummary items={5} className="mt-4" />
```

**Props:**
- `items`: Số items trong summary (default: `3`)
- `className`: Additional classes

### 11. SkeletonCheckout
Skeleton hoàn chỉnh cho checkout page.

```jsx
<SkeletonCheckout />
```

Không có props, tự động render layout checkout đầy đủ.

### 12. SkeletonLoadingOverlay
Skeleton cho loading overlay.

```jsx
<SkeletonLoadingOverlay size="md" message="Đang tải..." />
<SkeletonLoadingOverlay size="lg" message={null} />
```

**Props:**
- `size`: `"sm" | "md" | "lg" | "xl"` (default: `"md"`)
- `message`: Text message hoặc `null` để ẩn (default: `"Đang tải..."`)

## Ví dụ sử dụng

### Trang Checkout
```jsx
import { SkeletonCheckout } from '@/components/Skeleton';

if (!isCartLoaded) {
  return <SkeletonCheckout />;
}
```

### Product List
```jsx
import { SkeletonProductCard } from '@/components/Skeleton';

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <SkeletonProductCard key={i} />
    ))}
  </div>
) : (
  products.map(product => <ProductCard key={product.id} {...product} />)
)}
```

### Form Section
```jsx
import { SkeletonFormSection } from '@/components/Skeleton';

{loading ? (
  <SkeletonFormSection title icon inputs={4} />
) : (
  <FormSection />
)}
```

### Custom Skeleton
```jsx
import { Skeleton, SkeletonCard } from '@/components/Skeleton';

<SkeletonCard padding="p-6">
  <Skeleton variant="text" width="w-32" height="h-8" className="mb-4" />
  <Skeleton variant="rectangular" width="w-full" height="h-48" className="mb-4" />
  <Skeleton variant="text" width="w-full" height="h-4" />
  <Skeleton variant="text" width="w-3/4" height="h-4" />
</SkeletonCard>
```

## Lợi ích

1. **Đồng bộ**: Tất cả skeleton sử dụng cùng gradient shimmer effect
2. **Dễ bảo trì**: Chỉ cần sửa một file để cập nhật toàn bộ hệ thống
3. **Tái sử dụng**: Các component có sẵn cho các use case phổ biến
4. **Linh hoạt**: Component base cho phép tùy chỉnh hoàn toàn
5. **Type-safe**: Props được định nghĩa rõ ràng

## Cập nhật

Khi cần thay đổi style skeleton (màu sắc, animation, etc.), chỉ cần sửa file `src/components/Skeleton.js` - tất cả skeleton trong hệ thống sẽ tự động cập nhật.

