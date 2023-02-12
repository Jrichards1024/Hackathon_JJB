from recs1 import recs_v1
import sys, json
def read_in():
    lines = sys.stdin.readlines()
    top_artists = json.loads(lines[0])
    top_songs = json.loads(lines[1])
    related_artists = json.loads(lines[2])
    return top_artists,top_songs,related_artists

def main():
    # lines=
    top_artists,top_songs,related_artists = read_in()
    output = recs_v1(top_artists,top_songs,related_artists)
    print(output)
    return output

if __name__ == "__main__":
    main()