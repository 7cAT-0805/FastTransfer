import React from 'react';
import { Shield, Eye, Lock, Database, Cookie, Mail } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">隱私政策</h1>
            <p className="text-gray-600">最後更新日期：2024年1月1日</p>
          </div>

          <div className="prose max-w-none">
            <div className="space-y-8">
              {/* 概述 */}
              <section>
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Eye className="w-6 h-6 mr-2" />
                  隱私政策概述
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  FastTransfer（以下簡稱「我們」、「本網站」）致力於保護您的隱私權。
                  本隱私政策說明我們如何收集、使用、儲存和保護您的個人資訊。
                  使用本網站即表示您同意本隱私政策的條款。
                </p>
              </section>

              {/* 資訊收集 */}
              <section>
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Database className="w-6 h-6 mr-2" />
                  我們收集的資訊
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">自動收集的資訊</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>IP 位址和地理位置資訊</li>
                      <li>瀏覽器類型和版本</li>
                      <li>作業系統資訊</li>
                      <li>訪問時間和頁面瀏覽記錄</li>
                      <li>裝置識別碼</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">使用者提供的資訊</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>上傳的檔案及其元資料</li>
                      <li>房間創建和參與記錄</li>
                      <li>聯絡表單中的資訊（如有）</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 資訊使用 */}
              <section>
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Lock className="w-6 h-6 mr-2" />
                  資訊使用方式
                </h2>
                <p className="text-gray-700 mb-4">我們使用收集的資訊用於以下目的：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>提供和維護檔案傳輸服務</li>
                  <li>改善網站功能和使用者體驗</li>
                  <li>分析網站使用情況和趨勢</li>
                  <li>防止濫用和確保服務安全</li>
                  <li>遵守法律義務</li>
                  <li>顯示個人化廣告內容</li>
                </ul>
              </section>

              {/* Cookie 政策 */}
              <section>
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Cookie className="w-6 h-6 mr-2" />
                  Cookie 和追蹤技術
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    我們使用 Cookie 和類似的追蹤技術來改善您的瀏覽體驗：
                  </p>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">必要 Cookie</h3>
                    <p className="text-gray-700">用於網站基本功能運作，無法被停用。</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">分析 Cookie</h3>
                    <p className="text-gray-700">幫助我們了解訪客如何使用網站，包括 Google Analytics。</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">廣告 Cookie</h3>
                    <p className="text-gray-700">用於顯示相關廣告，包括 Google AdSense。</p>
                  </div>
                </div>
              </section>

              {/* 第三方服務 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">第三方服務</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Google AdSense</h3>
                    <p className="text-gray-700">
                      我們使用 Google AdSense 顯示廣告。Google 可能會使用 Cookie 
                      來顯示基於您過往訪問本網站或其他網站的廣告。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Google Analytics</h3>
                    <p className="text-gray-700">
                      我們使用 Google Analytics 來分析網站流量。Google Analytics 
                      會收集匿名化的使用資訊。
                    </p>
                  </div>
                </div>
              </section>

              {/* 資料保護 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">資料保護措施</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>所有資料傳輸均使用 HTTPS 加密</li>
                  <li>檔案在 30 分鐘後自動刪除</li>
                  <li>定期進行安全性評估</li>
                  <li>限制員工對個人資料的存取</li>
                  <li>使用安全的伺服器和資料庫</li>
                </ul>
              </section>

              {/* 使用者權利 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">您的權利</h2>
                <p className="text-gray-700 mb-4">您對於個人資料擁有以下權利：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>查詢我們持有的您的個人資料</li>
                  <li>要求更正不正確的資料</li>
                  <li>要求刪除您的個人資料</li>
                  <li>要求限制資料處理</li>
                  <li>反對資料處理</li>
                  <li>資料可攜性</li>
                </ul>
              </section>

              {/* 聯絡方式 */}
              <section className="bg-gray-50 p-6 rounded-lg">
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Mail className="w-6 h-6 mr-2" />
                  聯絡我們
                </h2>
                <p className="text-gray-700 mb-4">
                  如您對本隱私政策有任何疑問或需要行使您的權利，請透過以下方式聯絡我們：
                </p>
                <div className="text-gray-700">
                  <p>電子郵件：privacy@fastransfer.com</p>
                  <p>地址：台灣台北市信義區信義路五段7號</p>
                </div>
              </section>

              {/* 政策更新 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">政策更新</h2>
                <p className="text-gray-700">
                  我們可能會不時更新本隱私政策。任何重大變更都會在網站上公告，
                  並在適當情況下透過電子郵件通知您。建議您定期查看本頁面以了解最新政策。
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
