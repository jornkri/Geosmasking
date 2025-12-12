import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface MaskAttributes {
  maskLandscape: number;
  maskVegetation: number;
  maskBuildings: number;
  maskInfrastrukture: number;
  maskIntegratedMesh: number;
}

interface MaskFormProps {
  onSave: (attributes: MaskAttributes) => void;
  onCancel: () => void;
  initialAttributes?: MaskAttributes;
  isEditing?: boolean;
}

interface MaskOption {
  key: keyof MaskAttributes;
  label: string;
  description: string;
}

const maskOptions: MaskOption[] = [
  {
    key: 'maskLandscape',
    label: 'Landscape',
    description: 'Hide terrain and landscape elements'
  },
  {
    key: 'maskVegetation',
    label: 'Vegetation',
    description: 'Hide trees and other vegetation'
  },
  {
    key: 'maskBuildings',
    label: 'Buildings',
    description: 'Hide buildings and structures'
  },
  {
    key: 'maskInfrastrukture',
    label: 'Infrastructure',
    description: 'Hide roads, bridges and other infrastructure'
  },
  {
    key: 'maskIntegratedMesh',
    label: 'Integrated Mesh',
    description: 'Hide 3D mesh data'
  }
];

export function MaskForm({ onSave, onCancel, initialAttributes, isEditing }: MaskFormProps) {
  const [attributes, setAttributes] = useState<MaskAttributes>(
    initialAttributes || {
      maskLandscape: 0,
      maskVegetation: 0,
      maskBuildings: 0,
      maskInfrastrukture: 0,
      maskIntegratedMesh: 0
    }
  );

  const toggleMask = (key: keyof MaskAttributes) => {
    setAttributes(prev => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(attributes);
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="mb-2">Configure Masking Area</h2>
          <p className="text-gray-600 text-sm mb-6">
            Select which elements should be hidden within this area
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mb-6">
              {maskOptions.map(option => (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMask(option.key)}
                    className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      attributes[option.key] === 1
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        attributes[option.key] === 1
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-5 h-5" />
                Save Area
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}