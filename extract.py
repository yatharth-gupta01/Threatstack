import os
import glob
import xml.etree.ElementTree as ET

def extract():
    parsed_dir = os.path.join("data", "parsed_samples")
    files = glob.glob(os.path.join(parsed_dir, "*.xml"))
    
    for file in files:
        print(f"--- {os.path.basename(file)} ---")
        try:
            tree = ET.parse(file)
            root = tree.getroot()
            
            # Simple recursive search for any text
            def search_tags(tag_names):
                results = []
                for elem in root.iter():
                    if elem.tag.endswith('Data'):
                        name = elem.attrib.get('Name')
                        if name in tag_names and elem.text:
                            if elem.text not in results:
                                results.append(elem.text)
                return results

            commands = search_tags(['CommandLine', 'ScriptBlockText'])
            images = search_tags(['Image', 'ProcessName'])
            ips = search_tags(['IpAddress', 'SourceIp', 'DestinationIp'])
            files_used = search_tags(['TargetFilename', 'ShareLocalPath', 'RelativeTargetName'])
            
            print(f"Commands: {commands[:3]}")
            print(f"Images: {images[:3]}")
            print(f"IPs: {ips[:3]}")
            print(f"Files: {files_used[:3]}")
            
        except Exception as e:
            print(f"Error parsing: {e}")

if __name__ == "__main__":
    extract()
