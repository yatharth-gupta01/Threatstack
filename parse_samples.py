import os
import glob
from Evtx.Evtx import Evtx

def parse_all_evtx():
    raw_dir = os.path.join("data", "raw_samples")
    parsed_dir = os.path.join("data", "parsed_samples")
    
    os.makedirs(parsed_dir, exist_ok=True)
    
    evtx_files = glob.glob(os.path.join(raw_dir, "*.evtx"))
    
    if not evtx_files:
        print(f"No .evtx files found in {raw_dir}")
        return
        
    for evtx_path in evtx_files:
        filename = os.path.basename(evtx_path)
        base_name = os.path.splitext(filename)[0]
        xml_path = os.path.join(parsed_dir, f"{base_name}.xml")
        
        print(f"Converting {filename} to XML...")
        try:
            with Evtx(evtx_path) as log:
                with open(xml_path, "w", encoding="utf-8") as out:
                    out.write("<Events>\n")
                    for record in log.records():
                        out.write(record.xml())
                        out.write("\n")
                    out.write("</Events>\n")
            print(f"  [+] Success: {xml_path}")
        except Exception as e:
            print(f"  [-] Error converting {filename}: {str(e)}")

if __name__ == "__main__":
    parse_all_evtx()
