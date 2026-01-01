/**
 * Browser Console Script - Validate All Image Paths
 * 
 * Run this in Browser DevTools Console (F12 → Console) to verify images are accessible
 */

(async () => {
  console.log('🖼️  PORTFOLIO IMAGE VALIDATION STARTING...\n');
  
  // Test specific projects
  const testProjects = [
    { id: '00A-0130', image: '/images/Project/00A-0130-بيت-17-تموز--L-R3P2.webp' },
    { id: '00A-0134', image: '/images/Project/00A-0134-R1P4.webp' },
    { id: '00A-0140', image: '/images/Project/00A-0140-R1P2.webp' },
    { id: '00A-0152', image: '/images/Project/00A-0152-م-سمير--الفرات-R2P1.webp' },
    { id: '00A-0157', image: '/images/Project/00A-0157-8x17-كربلاء-عقيد-علاءlandscape-R1P1.webp' },
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const proj of testProjects) {
    try {
      const response = await fetch(proj.image, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ ${proj.id}: Image accessible (${response.status} ${response.statusText})`);
        successCount++;
      } else {
        console.log(`❌ ${proj.id}: Image error (${response.status} ${response.statusText})`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ ${proj.id}: Network error - ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n📊 Results: ${successCount} ✅ OK, ${failCount} ❌ Failed`);
  
  if (failCount === 0) {
    console.log('✨ All images are accessible! Refresh the page if you still see blank images.');
  } else {
    console.log('⚠️  Some images failed to load. Check the Network tab for details.');
  }
})();
