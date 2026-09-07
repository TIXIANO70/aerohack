"""
build_diorama.py
Script de automatización para Blender 4.3+ que construye el Diorama Isométrico 3D
de Santa Rita Verde con arquitectura, espacio público, estratos subterráneos y materiales PBR.
Exporta a .blend y .glb optimizado para Three.js.
"""

import bpy
import os
import math

def setup_scene():
    # 1. Limpieza total de objetos iniciales
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

    # Crear colecciones
    collections = {}
    col_names = ['01_Arquitectura', '02_Espacio_Publico', '03_Subsuelo_Hidrologico', '04_Hotspots']
    for name in col_names:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
        collections[name] = col
    return collections

def create_material(name, color_rgba, roughness=0.5, metallic=0.0, emissive_rgba=(0,0,0,1), emissive_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color_rgba
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emissive_rgba
            bsdf.inputs['Emission Strength'].default_value = emissive_strength
    return mat

def hex_to_rgba(hex_str, alpha=1.0):
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0
    # Corrección sRGB a Linear para Blender
    return ((r**2.2), (g**2.2), (b**2.2), alpha)

def build_materials():
    mats = {}
    mats['edificio'] = create_material('Mat_Edificio', hex_to_rgba('#1e293b'), roughness=0.7, metallic=0.15)
    mats['ventana'] = create_material('Mat_Ventana', hex_to_rgba('#38bdf8'), roughness=0.2, metallic=0.1, emissive_rgba=hex_to_rgba('#38bdf8'), emissive_strength=0.8)
    mats['terraza'] = create_material('Mat_Terraza', hex_to_rgba('#059669'), roughness=0.85, emissive_rgba=hex_to_rgba('#064e3b'), emissive_strength=0.2)
    mats['vegetacion'] = create_material('Mat_Vegetacion', hex_to_rgba('#34d399'), roughness=0.9)
    mats['vereda'] = create_material('Mat_Vereda', hex_to_rgba('#334155'), roughness=0.9, metallic=0.05)
    mats['calzada'] = create_material('Mat_Calzada', hex_to_rgba('#0f172a'), roughness=0.95)
    mats['jardin_cuenca'] = create_material('Mat_JardinCuenca', hex_to_rgba('#064e3b'), roughness=0.95)
    mats['planta_nativa'] = create_material('Mat_PlantaNativa', hex_to_rgba('#10b981'), roughness=0.5)
    mats['flor_rosa'] = create_material('Mat_FlorRosa', hex_to_rgba('#f43f5e'), roughness=0.4, emissive_rgba=hex_to_rgba('#f43f5e'), emissive_strength=0.5)
    mats['flor_ambar'] = create_material('Mat_FlorAmbar', hex_to_rgba('#fbbf24'), roughness=0.4, emissive_rgba=hex_to_rgba('#fbbf24'), emissive_strength=0.5)
    mats['sustrato'] = create_material('Mat_Sustrato', hex_to_rgba('#111a2e'), roughness=0.9, metallic=0.1)
    mats['caneria'] = create_material('Mat_Caneria', hex_to_rgba('#475569'), roughness=0.4, metallic=0.8)
    mats['caneria_agua'] = create_material('Mat_CaneriaAgua', hex_to_rgba('#38bdf8'), roughness=0.1, emissive_rgba=hex_to_rgba('#0284c7'), emissive_strength=1.2)
    mats['acuifero'] = create_material('Mat_Acuifero', hex_to_rgba('#0284c7'), roughness=0.15, emissive_rgba=hex_to_rgba('#0369a1'), emissive_strength=0.75)
    return mats

def link_to_collection(obj, collection):
    collection.objects.link(obj)

def build_diorama(collections, mats):
    # =========================================================================
    # 1. SUBSUELO HIDROLÓGICO (Colección 03)
    # =========================================================================
    c_subsuelo = collections['03_Subsuelo_Hidrologico']

    # Bloque de Tierra Base (Corte estratigráfico)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -1.5))
    soil = bpy.context.active_object
    soil.name = 'Corte_Subsuelo_Base'
    soil.scale = (8.0, 8.0, 3.0)
    soil.data.materials.append(mats['sustrato'])
    link_to_collection(soil, c_subsuelo)

    # Acuífero Subterráneo (Napa freática)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, -2.5))
    aquifer = bpy.context.active_object
    aquifer.name = 'Acuifero_Napa_Freatica'
    aquifer.scale = (7.85, 7.85, 0.8)
    aquifer.data.materials.append(mats['acuifero'])
    link_to_collection(aquifer, c_subsuelo)

    # Cañería Pluvial ranurada (Corte transversal)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=7.9, location=(0, 2.5, -0.8))
    pipe = bpy.context.active_object
    pipe.name = 'Caneria_Pluvial_Seccion'
    pipe.rotation_euler = (0, math.radians(90), 0)
    pipe.data.materials.append(mats['caneria'])
    link_to_collection(pipe, c_subsuelo)

    # Flujo de agua dentro de la cañería
    bpy.ops.mesh.primitive_cylinder_add(radius=0.28, depth=7.92, location=(0, 2.5, -0.8))
    pipe_water = bpy.context.active_object
    pipe_water.name = 'Agua_Flujo_Caneria'
    pipe_water.rotation_euler = (0, math.radians(90), 0)
    pipe_water.data.materials.append(mats['caneria_agua'])
    link_to_collection(pipe_water, c_subsuelo)

    # =========================================================================
    # 2. ESPACIO PÚBLICO (Colección 02)
    # =========================================================================
    c_espacio = collections['02_Espacio_Publico']

    # Vereda Permeable
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(1.75, 0, 0.15))
    sidewalk = bpy.context.active_object
    sidewalk.name = 'Vereda_Permeable_Drenante'
    sidewalk.scale = (4.5, 8.0, 0.3)
    sidewalk.data.materials.append(mats['vereda'])
    link_to_collection(sidewalk, c_espacio)

    # Calzada Asfáltica
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-2.25, 0, 0.1))
    road = bpy.context.active_object
    road.name = 'Calzada_Asfaltica_Terrero'
    road.scale = (3.5, 8.0, 0.2)
    road.data.materials.append(mats['calzada'])
    link_to_collection(road, c_espacio)

    # Cuenca del Jardín de Lluvia en Esquina
    bpy.ops.mesh.primitive_cylinder_add(radius=1.6, depth=0.35, vertices=32, location=(2.0, 1.5, 0.15))
    basin = bpy.context.active_object
    basin.name = 'Cuenca_Jardin_Lluvia'
    basin.data.materials.append(mats['jardin_cuenca'])
    link_to_collection(basin, c_espacio)

    # Flora Nativa y Flores
    for i in range(16):
        angle = (i / 16.0) * math.pi * 2 + (i * 0.3)
        r = 0.3 + (i % 4) * 0.25
        px = 2.0 + math.cos(angle) * r
        py = 1.5 + math.sin(angle) * r
        pz = 0.35

        # Tallo
        bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.6 + (i%3)*0.15, location=(px, py, pz + 0.3))
        stem = bpy.context.active_object
        stem.name = f'Planta_Nativa_Tallo_{i}'
        stem.data.materials.append(mats['planta_nativa'])
        link_to_collection(stem, c_espacio)

        # Flor en la cúspide
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.08, subdivisions=2, location=(px, py, pz + 0.65 + (i%3)*0.15))
        flower = bpy.context.active_object
        flower.name = f'Flor_Nativa_{i}'
        flower_mat = mats['flor_rosa'] if i % 2 == 0 else mats['flor_ambar']
        flower.data.materials.append(flower_mat)
        link_to_collection(flower, c_espacio)

    # =========================================================================
    # 3. ARQUITECTURA (Colección 01)
    # =========================================================================
    c_arq = collections['01_Arquitectura']

    # Edificio Residencial
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(2.4, -1.8, 2.55))
    bldg = bpy.context.active_object
    bldg.name = 'Edificio_Residencial'
    bldg.scale = (3.0, 4.0, 4.5)
    bldg.data.materials.append(mats['edificio'])
    link_to_collection(bldg, c_arq)

    # Ventanas
    for row in range(3):
        for col in range(2):
            bpy.ops.mesh.primitive_plane_add(size=1.0, location=(1.4 + col * 0.9, 0.22, 1.5 + row * 1.1))
            win = bpy.context.active_object
            win.name = f'Ventana_{row}_{col}'
            win.scale = (0.5, 0.6, 1.0)
            win.rotation_euler = (math.radians(90), 0, 0)
            win.data.materials.append(mats['ventana'])
            link_to_collection(win, c_arq)

    # Terraza Verde (Bandeja absorbente)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(2.4, -1.8, 4.85))
    terrace = bpy.context.active_object
    terrace.name = 'Terraza_Verde_Cubierta'
    terrace.scale = (3.1, 4.1, 0.3)
    terrace.data.materials.append(mats['terraza'])
    link_to_collection(terrace, c_arq)

    # Arbustos en la cubierta
    for i in range(10):
        bx = 1.3 + (i % 3) * 0.8 + (i * 0.1) % 0.4
        by = -3.2 + (i // 3) * 1.0 + (i * 0.15) % 0.5
        bz = 5.1
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.25 + (i%3)*0.08, subdivisions=2, location=(bx, by, bz))
        bush = bpy.context.active_object
        bush.name = f'Arbusto_Terraza_{i}'
        bush.data.materials.append(mats['vegetacion'])
        link_to_collection(bush, c_arq)

    # Bajada Pluvial de Techo a Jardín
    bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=4.6, location=(1.0, -0.1, 2.5))
    downspout = bpy.context.active_object
    downspout.name = 'Bajada_Pluvial_Vertical'
    downspout.data.materials.append(mats['caneria'])
    link_to_collection(downspout, c_arq)

    # =========================================================================
    # 4. HOTSPOTS Y LOCATORS (Colección 04)
    # =========================================================================
    c_hotspots = collections['04_Hotspots']
    hotspots = [
        ('Empty_Hotspot_Terraza', (2.4, -1.8, 5.0), {'component': 'terrace', 'label': 'Terraza Verde'}),
        ('Empty_Hotspot_Vereda', (1.75, 0.0, 0.35), {'component': 'sidewalk', 'label': 'Vereda Permeable'}),
        ('Empty_Hotspot_Jardin', (2.0, 1.5, 0.5), {'component': 'garden', 'label': 'Jardín de Lluvia'}),
        ('Empty_Hotspot_Caneria', (0.0, 2.5, -0.8), {'component': 'pipe', 'label': 'Cañería Pluvial'}),
        ('Empty_Hotspot_Aquifero', (0.0, 0.0, -2.5), {'component': 'aquifer', 'label': 'Napa Freática'})
    ]

    for name, pos, props in hotspots:
        empty = bpy.data.objects.new(name, None)
        empty.empty_display_type = 'SPHERE'
        empty.empty_display_size = 0.25
        empty.location = pos
        for k, v in props.items():
            empty[k] = v
        c_hotspots.objects.link(empty)

def export_assets():
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets', 'models'))
    os.makedirs(models_dir, exist_ok=True)

    blend_path = os.path.join(models_dir, 'diorama_santa_rita_verde.blend')
    glb_path = os.path.join(models_dir, 'diorama_santa_rita_verde.glb')

    # Guardar archivo .blend
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"[OK] Archivo Blender guardado en: {blend_path}")

    # Exportar archivo .glb (GLTF 2.0 binario)
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_apply=True,
        export_extras=True,
        export_materials='EXPORT'
    )
    print(f"[OK] Archivo GLTF/GLB exportado en: {glb_path}")

def main():
    print("=== Iniciando compilación de Diorama 3D en Blender ===")
    collections = setup_scene()
    mats = build_materials()
    build_diorama(collections, mats)
    export_assets()
    print("=== Compilación finalizada con éxito ===")

if __name__ == '__main__':
    main()
