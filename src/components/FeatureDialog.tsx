import { Trash2, Edit, X } from 'lucide-react';

interface MaskAttributes {
  maskLandscape: number;
  maskVegetation: number;
  maskBuildings: number;
  maskInfrastrukture: number;
  maskIntegratedMesh: number;
}

interface FeatureDialogProps {
  feature: any;
  onDelete: () => void;
  onEdit: () => void;
  onClose: () => void;
}

interface MaskOption {
  key: keyof MaskAttributes;
  label: string;
}

const maskOptions: MaskOption[] = [
  { key: 'maskLandscape', label: 'Landscape' },
  { key: 'maskVegetation', label: 'Vegetation' },
  { key: 'maskBuildings', label: 'Buildings' },
  { key: 'maskInfrastrukture', label: 'Infrastructure' },
  { key: 'maskIntegratedMesh', label: 'Integrated Mesh' }
];

export function FeatureDialog({ feature, onDelete, onEdit, onClose }: FeatureDialogProps) {
  const attributes = feature?.attributes || {};
  const activeMasks = maskOptions.filter(option => attributes[option.key] === 1);

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="mb-0">Selected Masking Area</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Active masks:</p>
            {activeMasks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeMasks.map(option => (
                  <span
                    key={option.key}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {option.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No masks active</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Edit Masks
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
