"""Authored asymmetric meniscus lens, Blender 5.x -> closed glTF volumes.
Run: blender -b -t 1 -P scripts/build-iavse-surface.py
Optional: -- --blend-output /absolute/path/iavse-optical-surface.blend
"""
import bpy
import bmesh
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
material = bpy.data.materials.new('IAVSE_ClearOpticalVolume')
material.use_nodes = True
node = next((n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None) or material.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
output = next((n for n in material.node_tree.nodes if n.type == 'OUTPUT_MATERIAL'), None) or material.node_tree.nodes.new('ShaderNodeOutputMaterial')
material.node_tree.links.new(node.outputs['BSDF'], output.inputs['Surface'])
node.inputs['Base Color'].default_value = (1, 1, 1, 1)
node.inputs['Roughness'].default_value = .018
node.inputs['Transmission Weight'].default_value = 1
node.inputs['IOR'].default_value = 1.45

edge_material = material.copy()
edge_material.name = 'IAVSE_PolishedRolledEdge'
edge_node = next(n for n in edge_material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
edge_node.inputs['IOR'].default_value = 1.50
edge_node.inputs['Roughness'].default_value = .025

def surface(columns, bands, output):
    vertices, faces = [], []
    for side in range(2):
        for i in range(columns + 1):
            x = -1.7 + 3.4 * i / columns
            top = .76 - .405 * (x - .66) ** 2
            for j in range(bands + 1):
                # More samples around the optical boundary, where curvature is
                # most visible; the large offscreen lower region needs fewer.
                t = (j / bands) ** 1.35
                y = top * (1 - t) - 2.0 * t
                profile = math.sin(math.pi * t)
                rim = .08 * math.sin(x * .7) + .04 * ((x - .66) / 2) ** 2
                # Distinct front/back curvatures create an actual transparent
                # volume rather than a constant-thickness almost-flat sheet.
                # The boundary stays thin while the central lens gathers depth.
                front_sag = (.40 + .08 * math.exp(-((x - .55) / 1.45) ** 2)) * profile
                back_sag = .16 * profile
                z = rim + .0375 + front_sag if side == 0 else rim - .0375 - back_sag
                vertices.append((x, -z, y))
    stride = bands + 1
    count = (columns + 1) * stride
    for side in range(2):
        offset = side * count
        for i in range(columns):
            for j in range(bands):
                a = offset + i * stride + j
                b = a + stride
                face = (a, a + 1, b + 1, b)
                faces.append(face if side == 0 else tuple(reversed(face)))
    for i in range(columns):
        a, b = i * stride, (i + 1) * stride
        faces.append((a, b, b + count, a + count))
        a, b = a + bands, b + bands
        faces.append((a, a + count, b + count, b))
    for j in range(bands):
        a, b = j, j + 1
        faces.append((a, a + count, b + count, b))
        a, b = columns * stride + j, columns * stride + j + 1
        faces.append((a, b, b + count, a + count))
    mesh = bpy.data.meshes.new('IAVSE_ClosedMeniscusLens')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new('IAVSE_OpticalSurface', mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    obj.data.materials.append(edge_material)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bevel = obj.modifiers.new('Optical rolled edge', 'BEVEL')
    bevel.width = .012
    bevel.segments = 6
    bevel.limit_method = 'ANGLE'
    bevel.angle_limit = .70
    bevel.material = 1
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    check = bmesh.new()
    check.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(check, faces=check.faces)
    assert all(edge.is_manifold for edge in check.edges), 'Optical lens must be closed and manifold'
    volume = check.calc_volume(signed=True)
    assert volume > 0, 'Lens normals must face outwards'
    check.to_mesh(obj.data)
    check.free()
    obj['role'] = 'closed_asymmetric_optical_membrane'
    obj['authoredThickness'] = .075
    obj['maximumThickness'] = .715
    obj['frontSag'] = .48
    obj['backSag'] = .16
    obj['design'] = 'IAVSE asymmetric closed meniscus lens; curved optical faces and polished physical boundary'
    bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', export_extras=True, use_selection=True)
    mesh = obj.data
    mesh.calc_loop_triangles()
    print(f'{output.name}: {len(mesh.loop_triangles)} triangles, {output.stat().st_size} bytes, closed outward volume {volume:.6f}')
    return obj

mobile = surface(96, 20, ROOT / 'public/models/iavse-optical-surface-mobile.glb')
bpy.data.objects.remove(mobile, do_unlink=True)
main = surface(256, 32, ROOT / 'public/models/iavse-optical-surface.glb')
if '--' in sys.argv:
    args = sys.argv[sys.argv.index('--') + 1:]
    if '--blend-output' in args:
        output = Path(args[args.index('--blend-output') + 1]).resolve()
        output.parent.mkdir(parents=True, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(output))
