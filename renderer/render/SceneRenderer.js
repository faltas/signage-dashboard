export function SceneRenderer(scene, regions, contentsMap) {
  const html = [];
  
  // Professional layout: check scene orientation and aspect ratio
  const sceneWidth = scene?.width || 1920;
  const sceneHeight = scene?.height || 1080;

  for (const region of regions) {
    const content = contentsMap[region.region_name] || `
      <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.2); color:#444; border:1px dashed #333;">
        ${region.region_name}
      </div>
    `;

    html.push(`
      <div style="
        position:absolute;
        top:${region.y}px;
        left:${region.x}px;
        width:${region.width}px;
        height:${region.height}px;
        z-index:${region.z_index || 0};
        overflow:hidden;
        transition: all 0.5s ease-in-out;
      ">
        ${content}
      </div>
    `);
  }

  return `
    <div style="position:relative; width:${sceneWidth}px; height:${sceneHeight}px; background:#000;">
      ${html.join("")}
    </div>
  `;
}
