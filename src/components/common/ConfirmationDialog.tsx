import { Dialog } from "@headlessui/react";
import { useRef } from "react";
import Modal from "./Modal";

type Props = {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}

export default function ConfirmationDialog({ open, onConfirm, onCancel, title, message }: Props) {
    const cancelButtonRef = useRef(null)

    return (
        <Modal open={open} onClose={onCancel} className="!w-80">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        {title}
                    </Dialog.Title>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm text-gray-900 font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 shadow-sm sm:ml-3 sm:w-auto min-w-16"
                    onClick={onCancel}
                >
                    No
                </button>
                <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-[#008001] hover:bg-[#008001AA] px-3 py-2 text-sm font-semibold text-white shadow-sm sm:mt-0 sm:w-auto min-w-16"
                    onClick={() => {
                        onConfirm();
                        onCancel()
                    }}
                    ref={cancelButtonRef}
                >
                    Yes
                </button>
            </div>
        </Modal>
    )
}
