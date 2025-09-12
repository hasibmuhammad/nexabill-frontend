"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";

// Example usage of the Modal component
export function ModalExamples() {
  const [showSimpleModal, setShowSimpleModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLargeModal, setShowLargeModal] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Modal Component Examples</h2>

      {/* Simple Modal */}
      <div>
        <Button onClick={() => setShowSimpleModal(true)}>
          Open Simple Modal
        </Button>

        <Modal
          isOpen={showSimpleModal}
          onClose={() => setShowSimpleModal(false)}
          title="Simple Modal"
          size="sm"
        >
          <p>This is a simple modal with just content and no footer buttons.</p>
        </Modal>
      </div>

      {/* Form Modal */}
      <div>
        <Button onClick={() => setShowFormModal(true)}>Open Form Modal</Button>

        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title="Form Modal"
          size="md"
          footer={{
            cancelText: "Cancel",
            confirmText: "Save",
            onCancel: () => setShowFormModal(false),
            onConfirm: () => {
              // Handle form submission
              console.log("Form submitted");
              setShowFormModal(false);
            },
            confirmVariant: "primary",
          }}
        >
          <div className="space-y-4">
            <p>This modal has a form with footer buttons.</p>
            <input
              type="text"
              placeholder="Enter some text"
              className="w-full p-2 border rounded"
            />
          </div>
        </Modal>
      </div>

      {/* Confirmation Modal */}
      <div>
        <Button onClick={() => setShowConfirmModal(true)} variant="outline">
          Open Confirm Modal
        </Button>

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Action"
          size="sm"
          footer={{
            cancelText: "No, Cancel",
            confirmText: "Yes, Delete",
            onCancel: () => setShowConfirmModal(false),
            onConfirm: () => {
              // Handle confirmation
              console.log("Action confirmed");
              setShowConfirmModal(false);
            },
            confirmVariant: "danger",
          }}
        >
          <p>
            Are you sure you want to perform this action? This cannot be undone.
          </p>
        </Modal>
      </div>

      {/* Large Modal */}
      <div>
        <Button onClick={() => setShowLargeModal(true)} variant="outline">
          Open Large Modal
        </Button>

        <Modal
          isOpen={showLargeModal}
          onClose={() => setShowLargeModal(false)}
          title="Large Content Modal"
          size="xl"
          footer={{
            cancelText: "Close",
            confirmText: "Submit",
            onCancel: () => setShowLargeModal(false),
            onConfirm: () => {
              console.log("Large modal submitted");
              setShowLargeModal(false);
            },
            confirmVariant: "primary",
          }}
        >
          <div className="space-y-4">
            <p>This is a large modal that can accommodate more content.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <h3 className="font-semibold">Section 1</h3>
                <p>Content for section 1</p>
              </div>
              <div className="p-4 border rounded">
                <h3 className="font-semibold">Section 2</h3>
                <p>Content for section 2</p>
              </div>
            </div>
            <p>You can put forms, tables, or any other complex content here.</p>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ModalExamples;
