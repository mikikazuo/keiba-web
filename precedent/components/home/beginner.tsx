"use client";
import BeginnerCard from "@/components/home/beginner-card";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
// import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Example() {
  const [open, setOpen] = useState(false);

  const cancelButtonRef = useRef(null);
  return (
    <>
      <ul className="menu">
        <li className="dark">
          <a href="#" onClick={() => setOpen(true)}>
            <i className="icon-beginner"></i>
            <span>表示の説明</span>
          </a>
        </li>
      </ul>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative my-auto w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-gray-700 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mt-3 text-center">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-white md:text-xl"
                        >
                          {`表示の説明（カードを${
                            isMobile ? "タップ" : "クリック"
                          }）`}
                        </Dialog.Title>
                        <div className="my-8 items-center">
                          <BeginnerCard />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center bg-gray-800 px-4 py-3">
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                    >
                      閉じる
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
