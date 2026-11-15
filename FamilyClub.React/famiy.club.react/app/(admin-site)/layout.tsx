// import React from 'react';
// import type { Metadata } from "next";
// import "../../styles/globals.css";
// import { Source_Sans_3, Roboto_Mono } from 'next/font/google';
// import UpNavigation from "../(user-site)/layout/header/UpNavigation";
// import AdminLayoutSidebarItems from './layout/layoutNav';
// import "../../styles/globals.css";
// const sourceSans = Source_Sans_3({
//   subsets: ['cyrillic', 'latin'],
//   variable: '--font-sans', // Назва CSS змінної для використання шрифту в стилях
// });

// const robotoMono = Roboto_Mono({
//   subsets: ['cyrillic', 'latin'],
//   variable: '--font-mono',
// });

// export default async function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="uk" className={`${sourceSans.variable} ${robotoMono.variable}`} >
//       <body>
//         <header className="bg-[var(--background-main)] overflow-x-0 relative z-30 h-[62px] shadow-[0px_0px_15px_0px_#24242499]">
//           <div className="max-w-[1220px] mx-auto flex items-center px-4 lg:px-0">
//             <UpNavigation />
//           </div>
//         </header>

//         {/* LEFT PART (Fixed Sidebar) */}
//         <aside
//           className="fixed left-0 top-0 bottom-0 z-10 select-none pointer-events-auto"
//           style={{
//             width: '369px',
//             backgroundColor: '#C7A381',
//             opacity: 1,
//             transform: 'rotate(0deg)',
//           }}
//         >
//           {/* Our sidebar navigator */}
//           <div
//             className="absolute"
//             style={{
//               width: "315px",
//               minHeight: "880px",
//               height: "max-content",
//               top: "71.76px",
//               left: "49.71px",
//               border: "15px solid transparent",
//               opacity: 1,
//               backgroundImage: "url('/images/admin_manager_layout/sidebar_bg.png')",
//               backgroundSize: "100% 100%",
//               backgroundPosition: "center",
//               backgroundRepeat: "no-repeat",
//               display: "flex",
//             flexDirection: "row",
//             gap: "5px", //
//             }}
//           >
//             {/* Content of sidebar */}
//             <div className="flex items-center gap-4">
//               {/*First row*/}
//               <div
//                 className="fixed flex items-center"
//                 style={{
//                   width: "294px",
//                   height: "60px",
//                   top: "120.76px",
//                   left: "69.71px",
//                   paddingLeft: "25px",
//                   paddingRight: "25px",
//                   gap: "25px",
//                   opacity: 1,
//                 }}
//               >
//                 {/* LEFT PART — IMAGE */}
//                 <div
//                   style={{
//                     width: "60px",
//                     height: "60px",
//                     backgroundImage: "url('/images/admin_manager_layout/cat_circle.svg')",
//                     backgroundSize: "cover",
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* <footer></footer> */}
//       </body>
//     </html>
//   );
// }

import React from "react";
import "../../styles/globals.css";
import { Source_Sans_3, Roboto_Mono } from "next/font/google";
import UpNavigation from "@/app/(user-site)/layout/header/UpNavigation";
import AdminLayoutSidebarItems from "./layout/layoutNav";
import PresenceHeartbeatMount from "./admin/users/section/PresenceHeartbeatMount";
import AdminSidebarUserCard from "./layout/AdminSidebarUserCard";
import AdminAccessGuard from "./layout/AdminAccessGuard";
import AdminProviders from "./layout/AdminProviders";

export const dynamic = "force-dynamic";

const sourceSans = Source_Sans_3({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sans",
});

const robotoMono = Roboto_Mono({
  subsets: ["cyrillic", "latin"],
  variable: "--font-mono",
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uk"
      className={`${sourceSans.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('librellis-theme');if(t==='ink-night')document.documentElement.setAttribute('data-theme','ink-night');}catch(e){}})();",
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "var(--admin-page-bg)",
          color: "var(--foreground-primary)",
        }}
      >
        <AdminProviders>
          <PresenceHeartbeatMount />
          {/* HEADER — fixed (ThemeToggle already in UpNavigation) */}
          <header
            className="bg-[var(--background-main)] flex flex-row z-30"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "62px",
              boxShadow: "var(--shadow-panel)",
            }}
          >
            <div className="max-w-[1220px] mx-auto flex items-center lg:px-0">
              <UpNavigation />
            </div>
          </header>

          <div
            className="fixed"
            style={{
              top: "62px",
              left: 0,
              bottom: 0,
              width: "20px",
              backgroundColor: "var(--admin-wood)",
              zIndex: 19,
            }}
          />

          {/* SIDEBAR — fixed */}
          <aside
            className="fixed z-20 flex flex-col"
            style={{
              top: "62px",
              left: "20px",
              bottom: 0,
              width: "389px",
              backgroundColor: "var(--admin-wood)",
              overflowY: "auto",
              overflowX: "clip",
            }}
          >
            <div
              className="relative box-border"
              style={{ padding: "24px 24px 24px 34px" }}
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none admin-parchment-bg"
                style={{
                  backgroundImage:
                    "url('/images/admin_manager_layout/sidebar_bg.png')",
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="relative z-10">
                <AdminSidebarUserCard />

                <div className="flex-1">
                  <AdminLayoutSidebarItems />
                </div>
                <div
                  id="sidebar-selection-root"
                  className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
                />
              </div>
            </div>
          </aside>

          <main
            className="relative flex flex-col bg-fixed"
            style={{
              marginLeft: "409px",
              marginTop: "62px",
              width: "calc(100% - 409px)",
              minHeight: "calc(100vh - 62px)",
              backgroundColor: "var(--admin-page-bg)",
              boxShadow: "var(--shadow-panel)",
            }}
          >
            <div
              aria-hidden
              className="admin-shelf-surface absolute inset-0 pointer-events-none"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
                style={{
                  backgroundImage:
                    "url('/images/usersPageAdmin/Rectangle326.png')",
                }}
              />
            </div>
            <div className="relative z-10 w-full flex-1">
              <AdminAccessGuard>{children}</AdminAccessGuard>
            </div>
          </main>
        </AdminProviders>
      </body>
    </html>
  );
}
