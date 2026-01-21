# Product Listing Multi-Step Form

This project implements a modern multi-step form with image upload functionality for product listings.

## Features

- **Multi-step navigation**: Progress through form steps with validation
- **Modern image upload**: Drag-and-drop interface with image previews
- **API integration**: Uses Axios to communicate with backend APIs
- **Responsive design**: Clean, modern UI with proper styling

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

Run the development server:
```bash
npm run dev
```

## Components

### MultiStepForm

The main component that handles the multi-step form workflow:

- **Step 1**: Image upload with React Dropzone
- **Step 2**: Product details form
- **Step 3**: Submission confirmation

### API Endpoints

The form communicates with two backend APIs:

1. **Images API**: `http://167.99.97.126/listing_api/images/`
   - Handles image uploads
   - Returns image URLs for use in the listing

2. **Listings API**: `http://167.99.97.126/listing_api/listings/`
   - Handles product listing creation
   - Accepts form data with image references

## Dependencies

- React
- Axios (for API requests)
- React Dropzone (for image upload widget)

## Implementation Details

### Image Upload

- Supports multiple file uploads (up to 10 files)
- Accepts JPEG, JPG, PNG, WEBP formats
- Shows real-time previews of uploaded images
- Allows removing individual images before upload

### Form Validation

- Validates required fields
- Shows error messages for failed API requests
- Prevents navigation to next step if validation fails

### State Management

- Uses React hooks (useState, useEffect)
- Manages form data and upload state
- Handles loading states during API calls

## Testing

The component includes basic test coverage for:
- Step navigation
- Form rendering
- Error handling
- API integration

## Future Enhancements

- Add more form fields as needed
- Implement form data persistence
- Add image editing capabilities
- Implement progress tracking for uploads
```

Now let me verify that the implementation is complete by checking the project structure:{"path": "listing-app/src"}# Listing-app
# Listing-app
# Listing-app
