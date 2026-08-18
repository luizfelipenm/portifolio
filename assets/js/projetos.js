// ══════════════════════════════════════════════
//  BLOB CURSOR (mesmo padrão das outras páginas)
// ══════════════════════════════════════════════
const blob = document.getElementById('blob');
document.addEventListener('mousemove', e => { blob.style.left = e.clientX + 'px'; blob.style.top = e.clientY + 'px'; });
if (window.matchMedia('(pointer:coarse)').matches) blob.style.display = 'none';
