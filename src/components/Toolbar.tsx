import { Plus, X, Layers, MousePointer } from 'lucide-react';

interface ToolbarProps {
  isDrawing: boolean;
  isSelecting: boolean;
  onStartDrawing: () => void;
  onCancelDrawing: () => void;
  onStartSelecting: () => void;
  onCancelSelecting: () => void;
  savedFeatures: number;
}

export function Toolbar({
  isDrawing,
  isSelecting,
  onStartDrawing,
  onCancelDrawing,
  onStartSelecting,
  onCancelSelecting,
  savedFeatures
}: ToolbarProps) {
  return (
    <div className="absolute top-6 right-6 flex flex-col gap-3">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h1 className="mb-4">Masking Areas</h1>
        
        <div className="space-y-2">
          {!isDrawing && !isSelecting ? (
            <>
              <button
                onClick={onStartDrawing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                <Plus className="w-5 h-5" />
                Draw New Area
              </button>
              <button
                onClick={onStartSelecting}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full"
              >
                <MousePointer className="w-5 h-5" />
                Select Area
              </button>
            </>
          ) : isDrawing ? (
            <button
              onClick={onCancelDrawing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
            >
              <X className="w-5 h-5" />
              Cancel Drawing
            </button>
          ) : (
            <button
              onClick={onCancelSelecting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
            >
              <X className="w-5 h-5" />
              Cancel Selection
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <Layers className="w-4 h-4" />
            <span className="text-sm">{savedFeatures} saved areas</span>
          </div>
        </div>
      </div>

      {isDrawing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
          <p className="text-sm text-blue-900">
            Click on the map to draw a polygon. Double-click to complete.
          </p>
        </div>
      )}

      {isSelecting && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-w-xs">
          <p className="text-sm text-gray-900">
            Click on a masking area to select it.
          </p>
        </div>
      )}
    </div>
  );
}