"use client";

import { Modal } from "@/components/ui/modal";
import Image from "next/image";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Privacy Policy & Terms of Service"
      size="xl"
    >
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Please review our privacy policy and terms of service below:
          </p>
          
          {/* Terms & Conditions Image */}
          <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden">
            <Image
              src="https://blogger.googleusercontent.com/img/a/AVvXsEh2l9bp8B4NLYcOeU57Mw3lEZF1BW2R5IRJu8cpQoPW-eZAvl-lKTHicAuXGpB3fO73BD-hEbzZ5II9S8_7M-NU6hE6_D9qeIyKv3JS2zUYuBdPMc8Qp1RTWSnmaLudnb32knhEtFh1lxsamsUaJYwn2d7-uGmkjKlfl-FOmeAbMAaXRS5vcohqF315pVxT"
              alt="Privacy Policy and Terms of Service"
              width={800}
              height={600}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
          
          {/* Additional Information */}
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Key Points:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your personal information will be kept secure and confidential</li>
              <li>• We will only use your information to process your repair request</li>
              <li>• You can request deletion of your data at any time</li>
              <li>• We do not share your information with third parties</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 bg-black text-white hover:bg-gray-800 rounded-full px-6 py-3 text-sm font-medium transition-colors"
            >
              I Understand
            </button>
            <button
              onClick={() => window.open('mailto:support@quickphonefix.com', '_blank')}
              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full px-6 py-3 text-sm font-medium transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
