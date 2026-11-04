# Rebuilds a car's showroom body from its hidden source collection at full detail (the
# designer's render smoothing level), keeping its materials, wheels and collider; rebakes AO;
# rebuilds the game bodies at their current triangle counts; exports both .glb files.
# In Blender, with <Car>.blend open:  exec(open(".../showroom_rebuild.py").read()); rebuild("J4")
# rebuild(car, dry=True) only checks that every source material maps to an existing one.
import bpy, mathutils
M = mathutils.Matrix
CFG = {
    "J7": dict(src="J7", recursive=True, skip_colls_prefix="tire ", ground=M.Translation((0, 0, 0.02)),
               rename={"j7 accent 1": "paint_accent_1", "j7 accent 2": "paint_accent_2", "j7 base color 1": "paint_base",
                       "j7 base color 2": "paint_base_2", "j7 base color 3": "paint_base_3", "j7 headlight": "light_head",
                       "j7 taillight": "light_tail", "j7 tire gray": "trim", "j7 under color": "paint_under",
                       "j9 interieror ": "interior", "j9 white": "interior_accent", "window": "glass"}),
    "J4": dict(src="body", recursive=True, skip_colls={"L1", "L2", "R1", "R2", "Collection 5"}, skip_mat="invisible",
               rename={**{f"j4 {k}": "paint_" + k.replace(" ", "_") for k in ("accent 1", "accent 2", "accent 3", "accent 4", "base", "tire well",
                       "trim mid", "trim sole", "trim sole back", "trim top", "trim top left")},
                       "j4 light": "light_head", "j4 light red": "light_tail", "window": "glass"},
               ground=M.Translation((0, 0, -(0.3933 - 0.723 / 2)))),
    "J11": dict(src="body", recursive=True, skip_colls={"L1", "L2", "L2.001", "L1.001"}, skip_objs={"FrontCylinder", "BackCylinder"},
                ground=M.Translation((0, 0, -(0.47 - 1.01 / 2)))),
    "J12": dict(src="body", recursive=False, ground=M.Translation((0, 0, -(0.53 - 1.17 / 2)))),
    "B1": dict(src="Collection 2", recursive=False, ground=M.Scale(0.5, 4) @ M.Translation((0, 0, 0.257))),
    "AM95": dict(src="body", recursive=True, ground=M.Translation((0, 0, 0.3)),
                 rename={"am95base": "paint_base", "am95metal": "paint_metal", "am95fade1": "paint_fade_1", "am95fade2": "paint_fade_2",
                         "am95fade3": "paint_fade_3", "am95fadetop": "paint_fade_top", "am95glow": "light_glow", "window.001": "glass"}),
    "Presto": dict(src="body", recursive=True, ground=M.Translation((0, 0, 0.3)),
                   rename={"presto 1": "paint_base", "presto 2": "paint_accent_1", "presto 3": "paint_accent_2", "shox black": "trim",
                           "shox black.001": "trim", "shox black.002": "trim", "presto glow": "light_glow", "window.001": "glass"}),
    "Shox": dict(src="body", recursive=True, ground=M.Translation((0, 0, 0.3)),
                 rename={"shox black": "paint_base", "shox gray": "paint_accent_1", "shox metalic": "paint_metal",
                         "shox red": "paint_accent_2", "shox glow": "light_glow", "window.001": "glass"}),
}
tris = lambda me: sum(len(p.vertices) - 2 for p in me.polygons)


def sources(car):
    c = CFG[car]
    src = bpy.data.collections[c["src"]]
    colls = [src] + (list(src.children_recursive) if c["recursive"] else [])
    out = []
    for coll in colls:
        if coll.name in c.get("skip_colls", ()) or (c.get("skip_colls_prefix") and coll.name.startswith(c["skip_colls_prefix"])):
            continue
        for o in coll.objects:
            if o.type != 'MESH' or o.hide_get() or o.hide_render or o.name in c.get("skip_objs", ()): continue
            if c.get("skip_mat") and o.material_slots and o.material_slots[0].material and o.material_slots[0].material.name == c["skip_mat"]: continue
            if o not in out: out.append(o)
    return out


def bake(o, car, cap):
    saved = []
    for m in o.modifiers:
        if m.type == 'SUBSURF':
            saved.append((m, m.levels, m.render_levels)); m.levels = min(m.render_levels, cap); m.render_levels = m.levels
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
    for m, l, r in saved: m.levels = l; m.render_levels = r
    me.transform(CFG[car]["ground"] @ o.matrix_world)
    if o.matrix_world.determinant() < 0: me.flip_normals()
    return me


def survey(car):
    lc = bpy.context.view_layer.layer_collection.children[CFG[car]["src"]]
    was = lc.hide_viewport; lc.hide_viewport = False
    objs = sources(car)
    res = {"objects": len(objs)}
    for cap in (1, 2, 3):
        t = 0; rows = []
        for o in objs:
            me = bake(o, car, cap); t += tris(me); rows.append((o.name, tris(me), any(m.type == 'SUBSURF' for m in o.modifiers))); bpy.data.meshes.remove(me)
        res[f"cap{cap}"] = t
        if cap == 3: res["top"] = sorted(rows, key=lambda r: -r[1])[:8]
    lc.hide_viewport = was
    show = bpy.data.collections[f"{car} Showroom"]
    res["showroom_body_now"] = sum(tris(o.data) for o in show.objects if o.type == 'MESH' and o.name.startswith("body_"))
    res["levels"] = sorted({m.render_levels for o in objs for m in o.modifiers if m.type == 'SUBSURF'})
    return res


import math, os, re, time, bmesh
import numpy as np
WEB = "/Users/antonicommodore/Documents/GitHub/ant-grails-club/models-src"
HEAVY_DEFAULT = 20000   # meshes without smoothing that are denser than this get a gentle cut


def decimate(o, target):
    def apply(**kw):
        m = o.modifiers.new("dec", 'DECIMATE')
        for k, v in kw.items(): setattr(m, k, v)
        dg = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); o.modifiers.remove(m)
        old = o.data; o.data = me; me.name = old.name; bpy.data.meshes.remove(old)
    apply(decimate_type='DISSOLVE', angle_limit=math.radians(1))
    if tris(o.data) > target * 1.2: apply(decimate_type='COLLAPSE', ratio=target / tris(o.data), use_collapse_triangulate=True)


def rebuild(car, heavy=None, dry=False):
    heavy = heavy or {}
    scene = bpy.context.scene
    show = bpy.data.collections[f"{car} Showroom"]; root = bpy.data.objects[car]
    game = bpy.data.collections[f"{car} Game"]; groot = bpy.data.objects[f"{car}_game"]
    rename = CFG[car].get("rename", {})
    old_body = [o for o in show.objects if o.type == 'MESH' and o.name.startswith("body_")]
    known = {s.material.name for o in old_body for s in o.material_slots if s.material}
    lc = bpy.context.view_layer.layer_collection.children[CFG[car]["src"]]; lc.hide_viewport = False
    objs = sources(car)
    need = {rename.get(s.material.name, s.material.name) for o in objs for s in o.material_slots if s.material}
    if dry or need - known:
        lc.hide_viewport = True
        return {"unknown_materials": sorted(need - known), "known": sorted(known)}
    log = {"before": sum(tris(o.data) for o in old_body)}
    # 1. new body meshes at full smoothing
    made = []
    for o in objs:
        me = bake(o, car, 9); me.name = o.name
        for i, m in enumerate(me.materials):
            if m and m.name in rename: me.materials[i] = bpy.data.materials[rename[m.name]]
        n = bpy.data.objects.new(o.name + "_hd", me); show.objects.link(n); n.parent = root
        made.append(n)
    lc.hide_viewport = True
    cuts = {}
    for n in made:
        src_name = n.name[:-3]; t = tris(n.data)
        target = heavy.get(src_name)
        if target is None and t > HEAVY_DEFAULT and not any(m.type == 'SUBSURF' for m in bpy.data.objects[src_name].modifiers):
            target = HEAVY_DEFAULT
        if target and t > target: decimate(n, target); cuts[src_name] = (t, tris(n.data))
    log["cuts"] = cuts
    # 2. swap out the old body meshes, join the new ones by material
    for o in old_body:
        me = o.data; bpy.data.objects.remove(o, do_unlink=True)
        if me.users == 0: bpy.data.meshes.remove(me)
    groups = {}
    for n in made: groups.setdefault(n.material_slots[0].material.name, []).append(n)
    bodies = []
    for mat, group in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in group: o.select_set(True)
        bpy.context.view_layer.objects.active = group[0]
        if len(group) > 1: bpy.ops.object.join()
        j = bpy.context.view_layer.objects.active; j.name = "body_" + mat; j.data.name = j.name; bodies.append(j)
    bpy.ops.object.select_all(action='DESELECT')
    log["after"] = sum(tris(o.data) for o in bodies)
    return finish(car, log)


def finish(car, log=None):
    """Rebake AO for the whole showroom, rebuild the game bodies from it, export both, save."""
    log = log if log is not None else {}
    scene = bpy.context.scene
    show = bpy.data.collections[f"{car} Showroom"]
    game = bpy.data.collections[f"{car} Game"]; groot = bpy.data.objects[f"{car}_game"]
    bodies = [o for o in show.objects if o.type == 'MESH' and o.name.startswith("body_")]
    # 3. AO: re-unwrap every showroom mesh but glass, bake into the car's AO image
    targets = [o for o in show.objects if o.type == 'MESH' and o.name != "body_glass"]
    for o in targets:
        uvs = o.data.uv_layers
        if not uvs: uvs.new(name="UVMap")
        ao = uvs.get("AO") or uvs.new(name="AO"); uvs.active = ao
        for u in uvs: u.active_render = (u.name != "AO")
    for o in targets: o.select_set(True)
    bpy.context.view_layer.objects.active = targets[0]
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.15192, island_margin=0.003, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.uv.pack_islands(margin=0.003, rotate=True)
    bpy.ops.object.mode_set(mode='OBJECT')
    img = bpy.data.images[f"{car}_ao"]
    if tuple(img.size) != (2048, 2048): img.scale(2048, 2048)
    img.pixels.foreach_set(np.ones(2048 * 2048 * 4, dtype=np.float32))
    ng = bpy.data.node_groups["glTF Material Output"]
    for o in targets:
        nt = o.material_slots[0].material.node_tree
        for x in [x for x in nt.nodes if x.name in ("ao_bake", "ao_uv", "ao_split", "ao_output")]: nt.nodes.remove(x)
        uv = nt.nodes.new('ShaderNodeUVMap'); uv.name = "ao_uv"; uv.uv_map = "AO"; uv.location = (-900, -500)
        tex = nt.nodes.new('ShaderNodeTexImage'); tex.name = "ao_bake"; tex.image = img; tex.location = (-650, -500)
        nt.links.new(uv.outputs['UV'], tex.inputs['Vector']); nt.nodes.active = tex
    lcs = bpy.context.view_layer.layer_collection.children
    keep = {show.name}
    excluded = [c.name for c in lcs if c.name not in keep and not c.exclude]
    for n in excluded: lcs[n].exclude = True
    fme = bpy.data.meshes.new("ao_temp_floor"); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=15); bm.to_mesh(fme); bm.free()
    floor = bpy.data.objects.new("ao_temp_floor", fme); scene.collection.objects.link(floor)
    if scene.world: scene.world.light_settings.distance = 0.8
    scene.render.engine = 'CYCLES'; scene.cycles.samples = 128
    b = scene.render.bake; b.use_selected_to_active = False; b.margin = 16; b.target = 'IMAGE_TEXTURES'
    bpy.ops.object.select_all(action='DESELECT')
    for o in targets: o.select_set(True)
    bpy.context.view_layer.objects.active = targets[0]
    t0 = time.time(); bpy.ops.object.bake(type='AO'); log["bake_s"] = round(time.time() - t0, 1)
    bpy.data.objects.remove(floor, do_unlink=True); bpy.data.meshes.remove(fme)
    for n in excluded: lcs[n].exclude = False
    scene.render.engine = 'BLENDER_EEVEE'
    img.save(); img.reload(); img.colorspace_settings.name = 'Non-Color'
    for o in targets:
        nt = o.material_slots[0].material.node_tree; tex = nt.nodes["ao_bake"]
        split = nt.nodes.new('ShaderNodeSeparateColor'); split.name = "ao_split"; split.location = (-380, -500)
        out = nt.nodes.new('ShaderNodeGroup'); out.name = "ao_output"; out.node_tree = ng; out.location = (-150, -500)
        nt.links.new(tex.outputs['Color'], split.inputs['Color']); nt.links.new(split.outputs['Red'], out.inputs['Occlusion'])
    # 4. game: new body copies decimated to the same triangle count as before (keeps AO UVs in step)
    key = lambda name: re.sub(r"_game(\.\d+)?$", "", name)
    old_game = {}
    for o in list(game.objects):
        if o.type == 'MESH' and o.name.startswith("body_"):
            old_game[key(o.name)] = tris(o.data); me = o.data
            bpy.data.objects.remove(o, do_unlink=True)
            if me.users == 0: bpy.data.meshes.remove(me)
    for o in bodies:
        n = o.copy(); n.data = o.data.copy(); n.name = n.data.name = o.name + "_game"
        game.objects.link(n); n.parent = groot; n.matrix_parent_inverse = o.matrix_parent_inverse.copy()
        want = old_game.get(o.name, int(tris(o.data) * 0.4))
        if tris(n.data) > max(want, 2000) * 1.05:
            m = n.modifiers.new("dec", 'DECIMATE'); m.ratio = want / tris(n.data); m.use_collapse_triangulate = True
            dg = bpy.context.evaluated_depsgraph_get()
            me = bpy.data.meshes.new_from_object(n.evaluated_get(dg)); n.modifiers.remove(m)
            old = n.data; n.data = me; me.name = n.name; bpy.data.meshes.remove(old)
    log["game_before"] = sum(old_game.values())
    log["game_after"] = sum(tris(o.data) for o in game.objects if o.type == 'MESH' and o.name.startswith("body_"))
    # 5. export both
    gx = groot.location.copy(); groot.location = (0, 0, 0)
    prev = bpy.context.view_layer.active_layer_collection
    outs = {}
    for coll, fname in ((show.name, f"{car}.glb"), (game.name, f"{car}_game.glb")):
        bpy.context.view_layer.active_layer_collection = lcs[coll]
        path = os.path.join(WEB, car, fname)
        bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_active_collection=True, use_active_collection_with_nested=True,
                                  export_apply=True, export_yup=True, export_cameras=False, export_lights=False, export_animations=False)
        outs[fname] = round(os.path.getsize(path) / 1e6, 2)
    bpy.context.view_layer.active_layer_collection = prev
    groot.location = gx
    log["MB"] = outs
    bpy.ops.wm.save_mainfile()
    return log


def export(car):
    """Re-export both .glb files as they are (e.g. after a Tire.blend change); no rebake."""
    show = bpy.data.collections[f"{car} Showroom"]; game = bpy.data.collections[f"{car} Game"]
    groot = bpy.data.objects[f"{car}_game"]
    lcs = bpy.context.view_layer.layer_collection.children
    gx = groot.location.copy(); groot.location = (0, 0, 0)
    prev = bpy.context.view_layer.active_layer_collection
    outs = {}
    for coll, fname in ((show.name, f"{car}.glb"), (game.name, f"{car}_game.glb")):
        bpy.context.view_layer.active_layer_collection = lcs[coll]
        path = os.path.join(WEB, car, fname)
        bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_active_collection=True, use_active_collection_with_nested=True,
                                  export_apply=True, export_yup=True, export_cameras=False, export_lights=False, export_animations=False)
        outs[fname] = round(os.path.getsize(path) / 1e6, 2)
    bpy.context.view_layer.active_layer_collection = prev
    groot.location = gx
    return outs
