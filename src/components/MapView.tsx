import { useEffect, useRef, useState } from 'react';
import { loadModules } from 'esri-loader';
import { MaskForm } from './MaskForm';
import { Toolbar } from './Toolbar';
import { FeatureDialog } from './FeatureDialog';

interface MaskAttributes {
  maskLandscape: number;
  maskVegetation: number;
  maskBuildings: number;
  maskInfrastrukture: number;
  maskIntegratedMesh: number;
}

export function MapView() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<any>(null);
  const [sketch, setSketch] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [currentGraphic, setCurrentGraphic] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [featureLayer, setFeatureLayer] = useState<any>(null);
  const [savedFeatures, setSavedFeatures] = useState<number>(0);
  const [isEditingFeature, setIsEditingFeature] = useState(false);

  useEffect(() => {
    if (!mapDiv.current) return;

    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/layers/VectorTileLayer',
      'esri/widgets/Sketch',
      'esri/layers/GraphicsLayer',
      'esri/geometry/SpatialReference',
      'esri/geometry/Point'
    ], {
      css: true,
      version: '4.34'
    }).then(([
      Map,
      MapView,
      FeatureLayer,
      VectorTileLayer,
      Sketch,
      GraphicsLayer,
      SpatialReference,
      Point
    ]) => {
      // UTM33 spatial reference
      const utm33SR = new SpatialReference({ wkid: 25833 });

      // Bakgrunnskart fra Geodata (kanvas, UTM33)
      const baseLayer = new VectorTileLayer({
        url: 'https://services.geodataonline.no/arcgis/rest/services/GeocacheVector/GeocacheKanvas/VectorTileServer'
      });

      // Feature Layer for maskeringsflater
      const maskLayer = new FeatureLayer({
        url: 'https://services.arcgis.com/2JyTvMWQSnM2Vi8q/arcgis/rest/services/Geos_mask_layer/FeatureServer/0',
        outFields: ['*'],
        popupEnabled: true,
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-fill',
            color: [255, 107, 107, 0.3],
            outline: {
              color: [255, 107, 107, 1],
              width: 2
            }
          }
        }
      });

      setFeatureLayer(maskLayer);

      const map = new Map({
        basemap: null,
        layers: [baseLayer, maskLayer]
      });

      // Opprett et Point-objekt med riktig spatial reference
      const centerPoint = new Point({
        x: 262907.973,
        y: 6651051.723,
        spatialReference: utm33SR
      });

      const mapView = new MapView({
        container: mapDiv.current!,
        map: map,
        center: centerPoint, // Oslo i UTM33
        zoom: 12,
        spatialReference: utm33SR,
        constraints: {
          snapToZoom: false,
          rotationEnabled: false
        }
      });

      // Graphics layer for tegning
      const graphicsLayer = new GraphicsLayer();
      map.add(graphicsLayer);

      const sketchWidget = new Sketch({
        view: mapView,
        layer: graphicsLayer,
        creationMode: 'single',
        availableCreateTools: ['polygon']
      });

      sketchWidget.on('create', (event: any) => {
        if (event.state === 'complete') {
          setCurrentGraphic(event.graphic);
          setShowForm(true);
          setIsDrawing(false);
        }
      });

      setView(mapView);
      setSketch(sketchWidget);

      // Click handler for selecting features
      mapView.on('click', async (event: any) => {
        if (!isSelecting) return;

        const response = await mapView.hitTest(event);
        const featureHit = response.results.find((result: any) => 
          result.graphic?.layer === maskLayer
        );

        if (featureHit) {
          setSelectedFeature(featureHit.graphic);
          setShowFeatureDialog(true);
        }
      });

      // Oppdater antall lagrede features
      maskLayer.queryFeatureCount().then((count: number) => {
        setSavedFeatures(count);
      });
    });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [isSelecting]);

  const startDrawing = () => {
    if (sketch) {
      setIsDrawing(true);
      sketch.create('polygon');
    }
  };

  const cancelDrawing = () => {
    if (sketch) {
      sketch.cancel();
      setIsDrawing(false);
      setShowForm(false);
      setCurrentGraphic(null);
    }
  };

  const startSelecting = () => {
    setIsSelecting(true);
  };

  const cancelSelecting = () => {
    setIsSelecting(false);
    setShowFeatureDialog(false);
    setSelectedFeature(null);
  };

  const handleDeleteFeature = async () => {
    if (!selectedFeature || !featureLayer) return;

    try {
      const objectId = selectedFeature.attributes.OBJECTID || selectedFeature.attributes.objectid;
      
      const result = await featureLayer.applyEdits({
        deleteFeatures: [{ objectId }]
      });

      if (result.deleteFeatureResults[0].objectId) {
        console.log('Feature deleted:', objectId);
        
        // Update feature count
        const count = await featureLayer.queryFeatureCount();
        setSavedFeatures(count);
        
        // Refresh feature layer
        featureLayer.refresh();
        
        setShowFeatureDialog(false);
        setSelectedFeature(null);
      } else {
        console.error('Could not delete feature');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      alert('Could not delete masking area. Check connection permissions.');
    }
  };

  const handleEditFeature = () => {
    setShowFeatureDialog(false);
    setIsEditingFeature(true);
    setShowForm(true);
  };

  const handleUpdateMask = async (attributes: MaskAttributes) => {
    if (!selectedFeature || !featureLayer) return;

    try {
      const objectId = selectedFeature.attributes.OBJECTID || selectedFeature.attributes.objectid;
      
      const feature = {
        attributes: {
          OBJECTID: objectId,
          ...attributes
        }
      };

      const result = await featureLayer.applyEdits({
        updateFeatures: [feature]
      });

      if (result.updateFeatureResults[0].objectId) {
        console.log('Feature updated:', objectId);
        
        // Refresh feature layer
        featureLayer.refresh();
        
        setShowForm(false);
        setSelectedFeature(null);
        setIsEditingFeature(false);
      } else {
        console.error('Could not update feature');
      }
    } catch (error) {
      console.error('Error updating feature:', error);
      alert('Could not update masking area. Check connection permissions.');
    }
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setIsEditingFeature(false);
    setSelectedFeature(null);
  };

  const handleSaveMask = async (attributes: MaskAttributes) => {
    if (!currentGraphic || !featureLayer) return;

    try {
      const feature = {
        geometry: currentGraphic.geometry,
        attributes: {
          ...attributes
        }
      };

      const result = await featureLayer.applyEdits({
        addFeatures: [feature]
      });

      if (result.addFeatureResults[0].objectId) {
        console.log('Feature saved with ID:', result.addFeatureResults[0].objectId);
        
        // Update feature count
        const count = await featureLayer.queryFeatureCount();
        setSavedFeatures(count);
        
        // Remove graphic from graphics layer
        if (sketch.layer) {
          sketch.layer.removeAll();
        }
        
        // Refresh feature layer
        featureLayer.refresh();
        
        setShowForm(false);
        setCurrentGraphic(null);
      } else {
        console.error('Could not save feature');
      }
    } catch (error) {
      console.error('Error saving mask:', error);
      alert('Could not save masking area. Check connection permissions.');
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapDiv} className="w-full h-full" />
      
      <Toolbar
        isDrawing={isDrawing}
        isSelecting={isSelecting}
        onStartDrawing={startDrawing}
        onCancelDrawing={cancelDrawing}
        onStartSelecting={startSelecting}
        onCancelSelecting={cancelSelecting}
        savedFeatures={savedFeatures}
      />

      {showForm && !isEditingFeature && (
        <MaskForm
          onSave={handleSaveMask}
          onCancel={cancelDrawing}
        />
      )}

      {showForm && isEditingFeature && (
        <MaskForm
          onSave={handleUpdateMask}
          onCancel={handleCancelEdit}
          initialAttributes={selectedFeature?.attributes}
          isEditing={true}
        />
      )}

      {showFeatureDialog && (
        <FeatureDialog
          feature={selectedFeature}
          onDelete={handleDeleteFeature}
          onEdit={handleEditFeature}
          onClose={cancelSelecting}
        />
      )}
    </div>
  );
}