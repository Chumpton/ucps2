# UCPS Widget Distribution

This folder contains the standalone widget version of the Consciousness Site.

## Files
- `cnscns-widget.js`: The main javascript bundle. Contains all logic, React, Three.js, and embedded assets (images/models).
- `style.css`: The styling for the widget.
- `index.html`: A demo showing how to embed it.

## Integration Instructions

1. **Copy Files**: Copy `cnscns-widget.js` and `style.css` to your project's assets folder (e.g., `/assets/js/` and `/assets/css/`).

2. **Add CSS**: Add the stylesheet link in the `<head>` of your page:
   ```html
   <link rel="stylesheet" href="/path/to/style.css">
   ```

3. **Add Container**: Place a `div` where you want the widget to appear. Give it a specific ID (default is `cnscns-widget`). Set the width and height as needed (the widget fills the container).
   ```html
   <div id="cnscns-widget" style="width: 100%; height: 600px; position: relative;"></div>
   ```

4. **Add Script**: Include the script at the bottom of your `<body>`.
   ```html
   <script src="/path/to/cnscns-widget.js"></script>
   ```

The script will automatically detect `<div id="cnscns-widget">` and render the experience into it.

## Manual Initialization

If you use a different container ID or need to load it dynamically:

```javascript
// Ensure script is loaded, then:
window.CnscnsWidget.init('my-custom-container-id');
```
