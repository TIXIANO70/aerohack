"""
render_diorama.py
Renderiza una captura nítida en alta resolución del diorama 3D de Santa Rita Verde en Blender.
"""

import bpy
import os
import math
import mathutils

def setup_camera_and_render():
    scene = bpy.context.scene

    # 1. Motor de Render y Parámetros
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 64
    scene.cycles.use_denoising = False
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100

    # Color de fondo oscuro (#070e1e)
    world = scene.world or bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.015, 0.035, 0.075, 1.0) # #070e1e
        bg_node.inputs['Strength'].default_value = 1.0

    # 2. Configurar Cámara Isométrica
    # Eliminar cámaras previas si existen
    for obj in list(scene.objects):
        if obj.type == 'CAMERA':
            bpy.data.objects.remove(obj, do_unlink=True)

    cam_data = bpy.data.cameras.new(name="Camera_Iso")
    cam_data.type = 'PERSP'
    cam_data.lens = 55
    cam_data.clip_start = 0.1
    cam_data.clip_end = 200

    cam_obj = bpy.data.objects.new("Camera_Iso", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    # Posicionar cámara en ángulo frontal-isométrico con encuadre completo
    cam_obj.location = mathutils.Vector((-16.0, 16.5, 13.0))
    target = mathutils.Vector((0.2, 0.0, 0.8))
    
    # Orientar la cámara directamente hacia el objetivo
    direction = target - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()

    # 3. Luces Principales
    # Eliminar luces previas si existen
    for obj in list(scene.objects):
        if obj.type == 'LIGHT':
            bpy.data.objects.remove(obj, do_unlink=True)

    # Sol Principal (Key Light frontal)
    sun_data = bpy.data.lights.new(name="Sun_Main", type='SUN')
    sun_data.energy = 5.5
    sun_data.color = (1.0, 0.98, 0.95)
    sun_obj = bpy.data.objects.new("Sun_Main", sun_data)
    sun_obj.location = mathutils.Vector((-10, 12, 16))
    sun_dir = mathutils.Vector((1.0, -1.0, -1.2))
    sun_obj.rotation_euler = sun_dir.to_track_quat('-Z', 'Y').to_euler()
    scene.collection.objects.link(sun_obj)

    # Sol Secundario de Relleno (Fill Light lateral)
    sun2_data = bpy.data.lights.new(name="Sun_Fill", type='SUN')
    sun2_data.energy = 2.5
    sun2_data.color = (0.75, 0.88, 1.0)
    sun2_obj = bpy.data.objects.new("Sun_Fill", sun2_data)
    sun2_dir = mathutils.Vector((-1.0, 1.0, -0.6))
    sun2_obj.rotation_euler = sun2_dir.to_track_quat('-Z', 'Y').to_euler()
    scene.collection.objects.link(sun2_obj)

    # Luz de acento cian en el acuífero
    point_data = bpy.data.lights.new(name="Point_Aquifer", type='POINT')
    point_data.energy = 800.0
    point_data.color = (0.1, 0.6, 1.0)
    point_obj = bpy.data.objects.new("Point_Aquifer", point_data)
    point_obj.location = (0, 0, -2.0)
    scene.collection.objects.link(point_obj)

def render_and_save():
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets', 'images'))
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, 'render_diorama_3d.png')

    bpy.context.scene.render.filepath = out_file
    print(f"=== Renderizando diorama hacia: {out_file} ===")
    bpy.ops.render.render(write_still=True)
    print(f"[OK] Render completado con éxito: {out_file}")

def main():
    blend_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets', 'models', 'diorama_santa_rita_verde.blend'))
    if os.path.exists(blend_file):
        bpy.ops.wm.open_mainfile(filepath=blend_file)
    setup_camera_and_render()
    render_and_save()

if __name__ == '__main__':
    main()
