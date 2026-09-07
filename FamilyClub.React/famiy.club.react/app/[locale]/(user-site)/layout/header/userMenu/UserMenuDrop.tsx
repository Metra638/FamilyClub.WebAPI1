"use client";

import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  MenuSeparator,
  Transition,
} from "@headlessui/react";
import Image from "next/image";
import { Fragment } from "react";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

type Member = {
  fullName?: string;
  email?: string;
  avatarData?: string | null;
};

type Props = {
  member?: Member | null;
  notificationCount?: number;
  onCabinet?: () => void;
  onNotifications?: () => void;
  onOrders?: () => void;
  onLibrary?: () => void;
  onAdminPanel?: () => void;
  showAdminPanel?: boolean;
  onLogout?: () => void;
};

export default function UserMenuDrop({
  member,
  notificationCount = 0,
  onCabinet,
  onNotifications,
  onOrders,
  onLibrary,
  onAdminPanel,
  showAdminPanel = false,
  onLogout,
}: Props) {
  const t = useTranslations();
  const displayName =
    member?.fullName || member?.email?.split("@")[0] || t("common.user");

  const avatarSrc = member?.avatarData
    ? `data:image/jpeg;base64,${member.avatarData}`
    : null;
  return (
    <Menu as="div" className="relative inline-block ">
      {({ open }) => (
        <>
          <div
            className={`transition-all ${open ? "bg-[#F5F3EE] shadow-[0px_0px_15px_0px_#242424CC] rounded-t-[26px]" : "rounded-[26px]"}`}
          >
            <MenuButton
              className="relative z-30 flex items-center gap-2 px-3 py-1 min-w-[144px] h-[40px]
  bg-transparent
  rounded-[26px]
  shadow-none hover:shadow-[0px_0px_15px_0px_#242424CC]
  hover:bg-[#F5F3EE]
  transition-all duration-200
  border-0 outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
            >
              <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex items-center justify-center">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="ti ti-user-circle text-white text-[14px]" />
                )}
              </div>

              <span className="flex-1 text-[14px] font-semibold text-[#242424]">
                {displayName}
              </span>

              <div className="w-[20px] h-[20px] mt-[14px]">
                <img
                  src="/images/header/Vector.svg"
                  className={`w-[14px] h-[8px] transition-transform duration-200 ${
                    open ? "rotate-180" : "rotate-0"
                  }`}
                  alt="arrow"
                />
              </div>
            </MenuButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-150"
              enterFrom="opacity-0 -translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0 -translate-y-2"
            >
              <MenuItems
                className="absolute left-0 top-0 z-20 w-full
            bg-[#F5F3EE]
            rounded-[26px]
            shadow-[0px_0px_15px_0px_#242424CC]
            overflow-hidden
            outline-none
            pt-[50px]"
              >
                <div className="flex flex-col justify-center ">
                  <div className="flex items-center gap-6 pt-4 pb-2 px-3">
                    <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex items-center justify-center">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <i className="ti ti-user-circle text-white" />
                      )}
                    </div>
                    <div className="font-bold text-[16px]">{displayName}</div>
                  </div>

                  <div className="py-1">
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={onCabinet}
                          className={`flex items-center w-full px-2 py-1 text-[14px] transition
        ${active ? "bg-[#ece7df]" : ""}`}
                        >
                          <div className="h-[40px] flex flex-row place-content-around items-center">
                            <div className="w-[22px] flex justify-center">
                              <Image
                                src="/images/header/work_24px.svg"
                                alt="cabinet"
                                width={20}
                                height={20}
                              />
                            </div>

                            <div className="w-[112px]">
                              <span>{t("header.userCabinet")}</span>
                            </div>
                          </div>
                        </button>
                      )}
                    </MenuItem>

                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={onNotifications}
                          className={`flex items-center w-full px-2 py-1 text-[14px] transition
        ${active ? "bg-[#ece7df]" : ""}`}
                        >
                          <div className="h-[40px] flex flex-row place-content-around items-center">
                            <div className="w-[22px] flex justify-center relative">
                              <Image
                                src="/images/header/add_24px.svg"
                                alt="notifications"
                                width={20}
                                height={18}
                              />

                              {notificationCount > 0 && (
                                <span
                                  className="
        absolute -top-2 -right-2
        bg-red-500 text-white text-[10px]
        px-1.5 py-[1px]
        rounded-full
        min-w-[16px]
        h-[14px]
        flex items-center justify-center
        z-[10]
      "
                                >
                                  {notificationCount}
                                </span>
                              )}
                            </div>

                            <div className="w-[112px]">
                              <span>{t("header.notifications")}</span>
                            </div>
                          </div>
                        </button>
                      )}
                    </MenuItem>

                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={onOrders}
                          className={`flex items-center w-full px-2 py-1 text-[14px] transition
        ${active ? "bg-[#ece7df]" : ""}`}
                        >
                          <div className="h-[40px] flex flex-row place-content-around items-center">
                            <div className="w-[22px] flex justify-center">
                              <Image
                                src="/images/header/assignment_24px.svg"
                                alt="orders"
                                width={20}
                                height={20}
                              />
                            </div>

                            <div className="w-[112px]">
                              <span>{t("header.orders")}</span>
                            </div>
                          </div>
                        </button>
                      )}
                    </MenuItem>

                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={onLibrary}
                          className={`flex items-center w-full px-2 py-1 text-[14px] transition
        ${active ? "bg-[#ece7df]" : ""}`}
                        >
                          <div className="h-[40px] flex flex-row place-content-around items-center">
                            <div className="w-[22px] flex justify-center">
                              <Image
                                src="/images/header/view_column_24px.svg"
                                alt="library"
                                width={20}
                                height={20}
                              />
                            </div>

                            <div className="w-[112px]">
                              <span>{t("header.library")}</span>
                            </div>
                          </div>
                        </button>
                      )}
                    </MenuItem>

                    {showAdminPanel && (
                      <MenuItem>
                        {({ active }) => (
                          <button
                            onClick={onAdminPanel}
                            className={`flex items-center w-full px-2 py-1 text-[14px] transition
        ${active ? "bg-[#ece7df]" : ""}`}
                          >
                            <div className="h-[40px] flex flex-row place-content-around items-center">
                              <div className="w-[22px] flex justify-center">
                                <Image
                                  src="/images/admin_manager_layout/books.svg"
                                  alt="admin panel"
                                  width={20}
                                  height={20}
                                />
                              </div>

                              <div className="w-[112px]">
                                <span>{t("header.adminPanel")}</span>
                              </div>
                            </div>
                          </button>
                        )}
                      </MenuItem>
                    )}

                    <MenuSeparator className="h-px bg-[#e0dbd2] my-1" />

                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={onLogout}
                          className={`flex items-center gap-2 w-full px-2 py-2 text-[14px] text-red-600 transition
                    ${active ? "bg-[#ece7df]" : ""}`}
                        >
                          <div className="h-[40px] flex flex-row place-content-around items-center">
                            <div className="w-[22px] flex justify-center">
                              <Image
                                src="/images/header/meeting_room_24px.svg"
                                alt="logout"
                                width={20}
                                height={20}
                              />
                            </div>

                            <div className="w-[112px]">
                              <span>{t("header.logout")}</span>
                            </div>
                          </div>
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </div>
              </MenuItems>
            </Transition>
          </div>
        </>
      )}
    </Menu>
  );
}
