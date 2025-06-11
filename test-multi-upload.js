/**
 * 多檔案上傳功能測試清單
 * 手動測試指南
 */

console.log('🧪 FastTransfer 多檔案上傳功能測試');
console.log('=====================================');

console.log('\n🔧 前置準備:');
console.log('1. 確保開發服務器正在運行');
console.log('   - 後端: http://localhost:3001');
console.log('   - 前端: http://localhost:5173');
console.log('2. 準備一些測試檔案（不同格式和大小）');

console.log('\n🎯 多檔案上傳功能測試清單:');
console.log('───────────────────────────────────');
console.log('✓ 基本功能測試:');
console.log('  [ ] 1. 開啟 http://localhost:5173');
console.log('  [ ] 2. 創建房間並成為房主');
console.log('  [ ] 3. 檢查上傳區域顯示「支援選擇多個檔案」提示');

console.log('\n✓ 多檔案選擇測試:');
console.log('  [ ] 4. 拖拽多個檔案到上傳區域');
console.log('  [ ] 5. 點擊選擇檔案（按住 Ctrl/Cmd 多選）');
console.log('  [ ] 6. 檔案列表正確顯示所有選中檔案');
console.log('  [ ] 7. 顯示檔案數量 \"已選擇的檔案 (X)\"');

console.log('\n✓ 檔案管理測試:');
console.log('  [ ] 8. 點擊個別檔案的移除按鈕');
console.log('  [ ] 9. 點擊「清空全部」按鈕');
console.log('  [ ] 10. 點擊「添加更多檔案」按鈕');
console.log('  [ ] 11. 檔案列表可滾動（當檔案很多時）');

console.log('\n✓ 批量上傳測試:');
console.log('  [ ] 12. 按鈕顯示 \"上傳全部檔案 (X)\"');
console.log('  [ ] 13. 點擊上傳，檔案依序上傳');
console.log('  [ ] 14. 每個檔案顯示上傳進度條');
console.log('  [ ] 15. 上傳期間按鈕和操作被禁用');
console.log('  [ ] 16. 顯示成功上傳 X 個檔案的提示');

console.log('\n✓ 錯誤處理測試:');
console.log('  [ ] 17. 上傳超過100MB的檔案（應該被拒絕）');
console.log('  [ ] 18. 網絡錯誤時顯示失敗提示');

console.log('\n✓ 多用戶測試:');
console.log('  [ ] 19. 其他用戶加入房間後能看到所有上傳的檔案');
console.log('  [ ] 20. 其他用戶可以下載所有檔案');
console.log('  [ ] 21. 房主離開後房間立即關閉，所有檔案被清理');

console.log('\n🚀 開始測試!');
console.log('請在瀏覽器中逐項檢查上述功能');
console.log('\n💡 測試建議:');
console.log('- 準備不同格式的檔案 (txt, jpg, pdf, zip 等)');
console.log('- 測試不同大小的檔案');
console.log('- 開啟多個瀏覽器窗口模擬多用戶');
console.log('- 檢查網路面板確認檔案正確上傳');

console.log('\n📝 如發現問題，請記錄:');
console.log('1. 出現問題的步驟');
console.log('2. 錯誤訊息（如有）');
console.log('3. 瀏覽器控制台日誌');
console.log('4. 預期行為 vs 實際行為');
