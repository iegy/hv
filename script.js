// DOM Elements
const htmlEditor = document.getElementById('htmlEditor');
const preview = document.getElementById('preview');
const refreshBtn = document.getElementById('refreshBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');

// Load saved content from localStorage
window.addEventListener('load', () => {
    const saved = localStorage.getItem('htmlContent');
    if (saved) {
        htmlEditor.value = saved;
        updatePreview();
    } else {
        // Load example content
        htmlEditor.value = `<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مثال</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f0f0f0;
            padding: 20px;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #667eea;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>مرحبا بك في HTML Viewer</h1>
        <p>عدّل الكود على اليسار لترى النتيجة هنا!</p>
    </div>
</body>
</html>`;
        updatePreview();
    }
});

// Update preview in real-time
htmlEditor.addEventListener('input', () => {
    updatePreview();
    // Auto-save to localStorage
    localStorage.setItem('htmlContent', htmlEditor.value);
});

// Refresh button
refreshBtn.addEventListener('click', updatePreview);

// Clear button
clearBtn.addEventListener('click', () => {
    if (confirm('هل تريد حذف كل المحتوى؟')) {
        htmlEditor.value = '';
        updatePreview();
        localStorage.removeItem('htmlContent');
    }
});

// Download button
downloadBtn.addEventListener('click', downloadHTML);

// Upload button
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileUpload);

// Update preview function
function updatePreview() {
    try {
        const doc = preview.contentDocument || preview.contentWindow.document;
        doc.open();
        doc.write(htmlEditor.value);
        doc.close();
    } catch (error) {
        console.error('خطأ في تحديث المعاينة:', error);
    }
}

// Download HTML file
function downloadHTML() {
    const content = htmlEditor.value;
    if (!content.trim()) {
        alert('الرجاء إدخال بعض محتوى HTML أولاً');
        return;
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(content));
    
    // Extract title from HTML if available
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const filename = titleMatch ? titleMatch[1] + '.html' : 'document.html';
    
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.name.match(/\.(html|htm)$/i)) {
        alert('الرجاء تحميل ملف HTML أو HTM فقط');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف كبير جداً (الحد الأقصى 5MB)');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        htmlEditor.value = event.target.result;
        updatePreview();
        localStorage.setItem('htmlContent', htmlEditor.value);
    };
    reader.onerror = () => {
        alert('حدث خطأ في قراءة الملف');
    };
    reader.readAsText(file);

    // Reset file input
    fileInput.value = '';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to download
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        downloadHTML();
    }
});
