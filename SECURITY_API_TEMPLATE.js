/**
 * Script Template: Apply Security to Admin API Routes
 * 
 * This template shows how to enhance existing admin API routes with security features.
 * Copy and adapt this pattern for each admin API route.
 */

// ============================================
// STEP 1: Add imports at the top of the file
// ============================================

// Add these imports after existing imports:
import { verifyAdminAPI, errorResponse, successResponse, validateRequestBody, handleAPIError } from '@/lib/api-security';

// Add this export if not already present:
export const dynamic = 'force-dynamic';

// ============================================
// STEP 2: Add admin verification to GET
// ============================================

export async function GET(request) {
    // Add this at the start of the function:
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) {
        return errorResponse(
            authError === 'Unauthorized' ? 'Vui lòng đăng nhập' : 'Chỉ admin mới có quyền truy cập',
            authError === 'Unauthorized' ? 401 : 403
        );
    }

    try {
        // Your existing logic here...

        // Replace old response with:
        return successResponse({ data: yourData }, 'Success message');

    } catch (error) {
        // Replace old error handling with:
        return handleAPIError(error, 'GET /api/admin/your-route');
    }
}

// ============================================
// STEP 3: Add validation to POST
// ============================================

export async function POST(request) {
    // Add admin verification:
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) {
        return errorResponse(
            authError === 'Unauthorized' ? 'Vui lòng đăng nhập' : 'Chỉ admin mới có quyền truy cập',
            authError === 'Unauthorized' ? 401 : 403
        );
    }

    try {
        const body = await request.json();

        // Add input validation:
        const validation = validateRequestBody(body, {
            // Define your validation schema:
            field1: {
                required: true,
                type: 'string',
                minLength: 3,
                maxLength: 255
            },
            field2: {
                required: true,
                type: 'number',
                min: 0
            },
            email: {
                required: false,
                type: 'email'
            },
            // Add more fields as needed...
        });

        if (!validation.valid) {
            return errorResponse(validation.message, 400, { errors: validation.errors });
        }

        // Use validated data:
        const { field1, field2, email } = validation.data;

        // Your existing logic here...

        // Replace old response with:
        return successResponse({ data: result }, 'Created successfully');

    } catch (error) {
        return handleAPIError(error, 'POST /api/admin/your-route');
    }
}

// ============================================
// STEP 4: Add validation to PUT/PATCH
// ============================================

export async function PUT(request, { params }) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) {
        return errorResponse(
            authError === 'Unauthorized' ? 'Vui lòng đăng nhập' : 'Chỉ admin mới có quyền truy cập',
            authError === 'Unauthorized' ? 401 : 403
        );
    }

    try {
        const body = await request.json();

        // Validate params if needed:
        const id = params?.id;
        if (!id) {
            return errorResponse('ID không hợp lệ', 400);
        }

        // Validate body:
        const validation = validateRequestBody(body, {
            // Your validation schema...
        });

        if (!validation.valid) {
            return errorResponse(validation.message, 400, { errors: validation.errors });
        }

        // Your existing logic here...

        return successResponse({ data: result }, 'Updated successfully');

    } catch (error) {
        return handleAPIError(error, 'PUT /api/admin/your-route');
    }
}

// ============================================
// STEP 5: Add validation to DELETE
// ============================================

export async function DELETE(request, { params }) {
    const { error: authError } = await verifyAdminAPI(request);
    if (authError) {
        return errorResponse(
            authError === 'Unauthorized' ? 'Vui lòng đăng nhập' : 'Chỉ admin mới có quyền truy cập',
            authError === 'Unauthorized' ? 401 : 403
        );
    }

    try {
        const id = params?.id;
        if (!id) {
            return errorResponse('ID không hợp lệ', 400);
        }

        // Your existing logic here...

        return successResponse({}, 'Deleted successfully');

    } catch (error) {
        return handleAPIError(error, 'DELETE /api/admin/your-route');
    }
}

// ============================================
// VALIDATION SCHEMA EXAMPLES
// ============================================

/*
Common validation types:

1. String:
   field: { required: true, type: 'string', minLength: 3, maxLength: 255 }

2. Email:
   email: { required: true, type: 'email' }

3. Phone:
   phone: { required: true, type: 'phone' }

4. Number:
   price: { required: true, type: 'number', min: 0, max: 1000000 }

5. Boolean:
   is_active: { required: false, type: 'boolean' }

6. UUID:
   user_id: { required: true, type: 'uuid' }

7. Custom validation:
   password: {
       required: true,
       type: 'string',
       validate: (value) => {
           if (value.length < 8) return 'Password must be at least 8 characters';
           return null; // null means valid
       }
   }
*/

// ============================================
// CHECKLIST FOR EACH API ROUTE
// ============================================

/*
Before deploying, ensure:

[ ] Added security imports
[ ] Added `export const dynamic = 'force-dynamic'`
[ ] Added admin verification to all methods
[ ] Added input validation to POST/PUT/PATCH
[ ] Replaced old responses with successResponse/errorResponse
[ ] Replaced old error handling with handleAPIError
[ ] Tested the route with valid data
[ ] Tested the route with invalid data
[ ] Tested the route without authentication
[ ] Tested the route with non-admin user
*/

// ============================================
// PRIORITY ORDER FOR ROUTES
// ============================================

/*
Apply security in this order:

HIGH PRIORITY (Critical data):
1. /api/admin/customers
2. /api/admin/orders
3. /api/admin/set-role
4. /api/admin/customers/[id]
5. /api/admin/orders/[id]

MEDIUM PRIORITY (Important data):
6. /api/admin/categories
7. /api/admin/banners
8. /api/admin/flash-sales
9. /api/admin/combo-promotions
10. /api/admin/promotions

LOW PRIORITY (Less sensitive):
11. /api/admin/reviews
12. /api/admin/statistics
13. /api/admin/reports
14. /api/admin/dashboard/*
*/
