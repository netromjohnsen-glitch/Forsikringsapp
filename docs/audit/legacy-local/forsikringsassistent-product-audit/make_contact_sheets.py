from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root=Path('/private/tmp/forsikringsassistent-product-audit/rendered')
pages=sorted(root.glob('page-*.png'),key=lambda p:int(p.stem.split('-')[1]))
out=root/'contact-sheets'; out.mkdir(exist_ok=True)
for start in range(0,len(pages),6):
    batch=pages[start:start+6]
    thumbs=[]
    for p in batch:
        im=Image.open(p).convert('RGB')
        w=650; h=round(im.height*w/im.width)
        im=im.resize((w,h),Image.Resampling.LANCZOS)
        canvas=Image.new('RGB',(w+16,h+46),'white'); canvas.paste(im,(8,38))
        d=ImageDraw.Draw(canvas); d.text((10,10),p.stem,fill='black')
        thumbs.append(canvas)
    cell_w=max(i.width for i in thumbs); cell_h=max(i.height for i in thumbs)
    sheet=Image.new('RGB',(cell_w*3,cell_h*2),(220,220,220))
    for i,im in enumerate(thumbs): sheet.paste(im,((i%3)*cell_w,(i//3)*cell_h))
    sheet.save(out/f'sheet-{start//6+1:02d}.jpg',quality=92)
print(f'{len(pages)} pages -> {(len(pages)+5)//6} sheets')
