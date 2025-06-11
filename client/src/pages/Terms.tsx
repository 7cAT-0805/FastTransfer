import React from 'react';
import { FileText, AlertTriangle, Shield, Scale, Users, Mail } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card">
          <div className="text-center mb-8">
            <FileText className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">使用條款</h1>
            <p className="text-gray-600">最後更新日期：2024年1月1日</p>
          </div>

          <div className="prose max-w-none">
            <div className="space-y-8">
              {/* 接受條款 */}
              <section>
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Scale className="w-6 h-6 mr-2" />
                  接受條款
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  歡迎使用 FastTransfer 檔案傳輸服務（以下簡稱「本服務」）。
                  使用本服務即表示您同意遵守並受本使用條款約束。
                  如果您不同意這些條款，請勿使用本服務。
                </p>
              </section>

              {/* 服務說明 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">服務說明</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    FastTransfer 提供即時檔案傳輸和分享服務，允許使用者：
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>創建臨時檔案分享房間</li>
                    <li>上傳和下載檔案</li>
                    <li>與他人分享檔案連結</li>
                    <li>即時檔案傳輸功能</li>
                  </ul>
                </div>
              </section>

              {/* 使用者責任 */}
              <section>
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Users className="w-6 h-6 mr-2" />
                  使用者責任與義務
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">允許的使用</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>合法的檔案分享和傳輸</li>
                      <li>個人和商業用途的檔案交換</li>
                      <li>遵守所有適用的法律法規</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">禁止的使用</h3>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      <li>上傳或分享違法、有害或不當內容</li>
                      <li>侵犯他人智慧財產權的檔案</li>
                      <li>惡意軟體、病毒或有害程式</li>
                      <li>兒童不宜或成人內容</li>
                      <li>違反他人隱私的內容</li>
                      <li>垃圾郵件或大量無用檔案</li>
                      <li>嘗試破壞或干擾服務運作</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 檔案政策 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">檔案管理政策</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-800 mb-2">重要提醒</h3>
                      <ul className="text-yellow-700 text-sm space-y-1">
                        <li>• 檔案將在房間創建後 30 分鐘自動刪除</li>
                        <li>• 我們不會永久儲存您的檔案</li>
                        <li>• 請確保重要檔案有其他備份</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>單一檔案大小限制：100MB</li>
                  <li>房間自動過期時間：30 分鐘</li>
                  <li>我們保留刪除違規內容的權利</li>
                  <li>對於遺失的檔案，我們不承擔責任</li>
                </ul>
              </section>

              {/* 隱私和安全 */}
              <section>
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Shield className="w-6 h-6 mr-2" />
                  隱私和安全
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>所有檔案傳輸均經過加密保護</li>
                  <li>我們不會主動查看您的檔案內容</li>
                  <li>房間代碼請勿分享給不信任的人</li>
                  <li>請詳閱我們的隱私政策了解資料處理方式</li>
                </ul>
              </section>

              {/* 智慧財產權 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">智慧財產權</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    您對上傳的檔案保留所有權利。同時，您保證：
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>擁有上傳檔案的合法權利</li>
                    <li>不會侵犯他人的智慧財產權</li>
                    <li>對因侵權行為造成的後果負責</li>
                  </ul>
                  <p className="text-gray-700">
                    FastTransfer 網站的設計、程式碼和商標均受智慧財產權保護。
                  </p>
                </div>
              </section>

              {/* 免責聲明 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">免責聲明</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-medium text-red-800 mb-2">服務現況提供</h3>
                  <p className="text-red-700 text-sm">
                    本服務按「現況」提供，我們不對服務的可用性、準確性或可靠性做出保證。
                  </p>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>不保證服務不會中斷或無錯誤</li>
                  <li>不對檔案遺失或損壞負責</li>
                  <li>不對使用者間的檔案內容糾紛負責</li>
                  <li>不對第三方廣告內容負責</li>
                </ul>
              </section>

              {/* 責任限制 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">責任限制</h2>
                <p className="text-gray-700 mb-4">
                  在法律允許的最大範圍內，FastTransfer 及其關聯公司不對以下情況承擔責任：
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>直接、間接、附帶或衍生性損害</li>
                  <li>利潤損失、資料遺失或業務中斷</li>
                  <li>第三方的行為或內容</li>
                  <li>不可抗力事件造成的服務中斷</li>
                </ul>
              </section>

              {/* 終止服務 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">服務終止</h2>
                <p className="text-gray-700 mb-4">我們保留在以下情況下終止或暫停服務的權利：</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>違反本使用條款</li>
                  <li>濫用服務或從事非法活動</li>
                  <li>技術維護或升級需要</li>
                  <li>商業決策考量</li>
                </ul>
              </section>

              {/* 管轄法律 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">適用法律</h2>
                <p className="text-gray-700">
                  本使用條款受中華民國法律管轄。任何爭議應由台灣台北地方法院管轄審理。
                </p>
              </section>

              {/* 聯絡資訊 */}
              <section className="bg-gray-50 p-6 rounded-lg">
                <h2 className="flex items-center text-2xl font-semibold text-gray-900 mb-4">
                  <Mail className="w-6 h-6 mr-2" />
                  聯絡我們
                </h2>
                <p className="text-gray-700 mb-4">
                  如您對本使用條款有任何疑問，請透過以下方式聯絡我們：
                </p>
                <div className="text-gray-700">
                  <p>電子郵件：legal@fastransfer.com</p>
                  <p>地址：台灣台北市信義區信義路五段7號</p>
                </div>
              </section>

              {/* 條款更新 */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">條款修改</h2>
                <p className="text-gray-700">
                  我們可能會不時修改這些使用條款。重大修改將在網站上公告至少 30 天。
                  繼續使用服務即表示您接受修改後的條款。
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
