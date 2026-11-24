import{mkdirSync,readdirSync,readFileSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output',E=new TextEncoder();
// Opcode info ((imm<<4)|(pops<<2)|pushes)+1, 0 = unknown opcode.
const T=new Uint8Array(256);
T[0]=1;T[1]=18;T[2]=66;T[3]=5;T[4]=7;T[5]=11;T[6]=12;T[7]=16;
for(let o=16;o<35;o++)if(o!==31)T[o]=o===23||o===27?6:10;
T[48]=33;T[49]=37;T[50]=37;T[51]=33;T[52]=1;T[64]=6;T[65]=9;T[80]=5;T[81]=5;T[82]=2;T[83]=5;
for(const d of readdirSync(I,{withFileTypes:true})){
if(!d.isDirectory())continue;
const id=d.name,p=readFileSync(join(I,id,'program.bin')),q=readFileSync(join(I,id,'input.bin')),n=p.length;
const D=new Int32Array(256);let sp=0;
const C=new Int32Array(64);let cp=0;
const M=new Int32Array(256);
const b=new Uint8Array(65536);let ol=0,ip=0,pc=0,st=0,ex=0;
L:for(;;){
if(st===1e6){ex=10;break}
if(pc<0||pc>=n){ex=9;break}
const o=p[pc],v=T[o];
if(!v){ex=5;break}
const w=v-1,im=w>>4,po=w>>2&3,pu=w&3;
if(pc+im>=n){ex=9;break}
st++;
const nx=pc+1+im;
if(sp<po){ex=2;break}
if(sp-po+pu>256){ex=3;break}
pc=nx;
switch(o){
case 0:ex=0;break L;
case 1:D[sp++]=p[nx-1]<<24>>24;break;
case 2:D[sp++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;break;
case 3:sp--;break;
case 4:D[sp]=D[sp-1];sp++;break;
case 5:{const t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t;break}
case 6:D[sp]=D[sp-2];sp++;break;
case 7:{const a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;break}
case 23:D[sp-1]=-D[sp-1]|0;break;
case 27:D[sp-1]=~D[sp-1];break;
case 48:case 49:case 50:{const r=(p[nx-2]|p[nx-1]<<8)<<16>>16;let t=1;if(o!==48){const x=D[--sp];t=o===49?x===0:x!==0}if(t)pc=nx+r;break}
case 51:if(cp===64){ex=7;break L}C[cp++]=nx;pc=p[nx-2]|p[nx-1]<<8;break;
case 52:if(cp===0){ex=8;break L}pc=C[--cp];break;
case 64:{const a=D[sp-1];if(a<0||a>255){ex=6;break L}D[sp-1]=M[a];break}
case 65:{const a=D[sp-1],x=D[sp-2];if(a<0||a>255){ex=6;break L}sp-=2;M[a]=x;break}
case 80:{const s=E.encode(String(D[sp-1]));if(ol+s.length>65536){ex=11;break L}sp--;b.set(s,ol);ol+=s.length;break}
case 81:if(ol+1>65536){ex=11;break L}b[ol++]=D[--sp]&255;break;
case 82:D[sp++]=ip<q.length?q[ip++]:-1;break;
case 83:ex=D[--sp]&255;break L;
default:{const y=D[sp-1],a=D[sp-2];let r;
switch(o){
case 16:r=a+y|0;break;
case 17:r=a-y|0;break;
case 18:r=Math.imul(a,y);break;
case 19:if(y===0){ex=4;break L}r=a===-2147483648&&y===-1?a:(a/y)|0;break;
case 20:if(y===0){ex=4;break L}r=y===-1?0:a%y|0;break;
case 21:if(y===0){ex=4;break L}r=Math.floor((a>>>0)/(y>>>0))|0;break;
case 22:if(y===0){ex=4;break L}r=(a>>>0)%(y>>>0)|0;break;
case 24:r=a&y;break;
case 25:r=a|y;break;
case 26:r=a^y;break;
case 28:r=a<<(y&31);break;
case 29:r=a>>(y&31);break;
case 30:r=a>>>(y&31)|0;break;
case 32:r=a===y?1:0;break;
case 33:r=a<y?1:0;break;
case 34:r=(a>>>0)<(y>>>0)?1:0;break;
}
sp-=2;D[sp++]=r}
}
}
mkdirSync(join(O,id),{recursive:true});
writeFileSync(join(O,id,'stdout.bin'),b.subarray(0,ol));
writeFileSync(join(O,id,'exit.txt'),ex+'\n');
}
